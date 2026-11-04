import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { openStatus } from "@/lib/hours";
import { money, digits, TYPE_LABEL } from "@/lib/format";

export const runtime = "nodejs";
const clip = (s, n) => String(s ?? "").trim().slice(0, n);

export async function POST(req) {
  await ready();
  const s = await getSettings();
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: "Tu pedido está vacío." }, { status: 400 });
  if (!s.orders.enabled) return NextResponse.json({ error: "Los pedidos en línea están pausados en este momento." }, { status: 409 });
  const st = openStatus(s);
  if (!st.open) return NextResponse.json({ error: st.next ? `Estamos cerrados. Abrimos ${st.next.when} a las ${st.next.at}.` : "Estamos cerrados en este momento." }, { status: 409 });

  const type = ["mesa", "recoger", "domicilio"].includes(body.type) ? body.type : null;
  if (!type) return NextResponse.json({ error: "Elige cómo quieres recibir tu pedido." }, { status: 400 });
  if (type === "domicilio" && !s.orders.delivery) return NextResponse.json({ error: "Hoy no estamos haciendo domicilios." }, { status: 400 });
  const tableNo = type === "mesa" ? parseInt(body.table, 10) : null;
  if (type === "mesa" && !(tableNo >= 1 && tableNo <= (s.tables || 99))) return NextResponse.json({ error: "El número de mesa no es válido." }, { status: 400 });
  const name = clip(body.name, 60), phone = clip(body.phone, 20), address = clip(body.address, 160), notes = clip(body.notes, 300);
  if (!name) return NextResponse.json({ error: "Escribe tu nombre." }, { status: 400 });
  if (type !== "mesa" && digits(phone).length < 7) return NextResponse.json({ error: "Escribe un teléfono de contacto válido." }, { status: 400 });
  if (type === "domicilio" && address.length < 6) return NextResponse.json({ error: "Escribe la dirección de entrega." }, { status: 400 });

  // Los precios se recalculan con la base de datos: el cliente no puede cambiarlos.
  const ids = [...new Set(body.items.map(i => parseInt(i.id, 10)).filter(Boolean))];
  const rows = ids.length ? await sql`select id, name, price, extras, available, active from products where id = any(${ids})` : [];
  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  const items = [];
  for (const it of body.items.slice(0, 50)) {
    const p = byId[parseInt(it.id, 10)];
    if (!p || !p.active) return NextResponse.json({ error: "Uno de los productos ya no está en la carta. Revisa tu pedido." }, { status: 409 });
    if (!p.available) return NextResponse.json({ error: `${p.name} se agotó. Quítalo de tu pedido para continuar.` }, { status: 409 });
    const qty = Math.min(20, Math.max(1, parseInt(it.qty, 10) || 1));
    const chosen = (Array.isArray(it.extras) ? it.extras : []).map(n => (p.extras || []).find(e => e.name === n)).filter(Boolean);
    const unit = p.price + chosen.reduce((a, e) => a + (e.price || 0), 0);
    items.push({ id: p.id, name: p.name, qty, unit, extras: chosen.map(e => ({ name: e.name, price: e.price })), note: clip(it.note, 120), total: unit * qty });
  }
  const subtotal = items.reduce((a, i) => a + i.total, 0);
  if (type === "domicilio" && s.orders.minOrder && subtotal < s.orders.minOrder) return NextResponse.json({ error: `El pedido mínimo para domicilio es ${money(s.orders.minOrder, s.currency)}.` }, { status: 400 });
  const fee = type === "domicilio" ? (s.orders.deliveryFee || 0) : 0;
  const total = subtotal + fee;

  const [order] = await sql`insert into orders (type, table_no, customer_name, customer_phone, address, notes, items, subtotal, delivery_fee, total)
    values (${type}, ${tableNo}, ${name}, ${phone || null}, ${address || null}, ${notes || null}, ${sql.json(items)}, ${subtotal}, ${fee}, ${total})
    returning id, created_at`;

  const m = n => money(n, s.currency);
  const lines = [
    `*Pedido #${order.id}* · ${s.name}`,
    type === "mesa" ? `Mesa ${tableNo}` : TYPE_LABEL[type],
    "",
    ...items.flatMap(i => [`${i.qty} × ${i.name} — ${m(i.total)}`, ...i.extras.map(e => `   + ${e.name}`), ...(i.note ? [`   Nota: ${i.note}`] : [])]),
    "",
    ...(fee ? [`Subtotal: ${m(subtotal)}`, `Domicilio: ${m(fee)}`] : []),
    `*Total: ${m(total)}*`,
    "",
    `Nombre: ${name}`,
    ...(phone ? [`Teléfono: ${phone}`] : []),
    ...(type === "domicilio" ? [`Dirección: ${address}`] : []),
    ...(notes ? [`Notas: ${notes}`] : [])
  ];
  const waUrl = `https://wa.me/${digits(s.whatsapp)}?text=${encodeURIComponent(lines.join("\n"))}`;
  return NextResponse.json({ id: order.id, total, waUrl });
}
