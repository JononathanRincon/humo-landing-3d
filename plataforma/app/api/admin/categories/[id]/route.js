import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  await ready();
  const b = await req.json().catch(() => ({}));
  const id = parseInt(params.id, 10);
  if ("name" in b) { const n = String(b.name || "").trim().slice(0, 40); if (!n) return NextResponse.json({ error: "La categoría necesita un nombre." }, { status: 400 }); await sql`update categories set name = ${n} where id = ${id}`; }
  if ("active" in b) await sql`update categories set active = ${!!b.active} where id = ${id}`;
  if ("move" in b) {
    const all = await sql`select id from categories order by position, id`;
    const i = all.findIndex(c => c.id === id), j = i + (b.move > 0 ? 1 : -1);
    if (i >= 0 && j >= 0 && j < all.length) { [all[i], all[j]] = [all[j], all[i]]; for (const [k, c] of all.entries()) await sql`update categories set position = ${k} where id = ${c.id}`; }
  }
  const [row] = await sql`select * from categories where id = ${id}`;
  return NextResponse.json({ category: row });
}

export async function DELETE(_req, { params }) {
  await ready();
  const id = parseInt(params.id, 10);
  const [{ n }] = await sql`select count(*)::int as n from products where category_id = ${id}`;
  if (n > 0) return NextResponse.json({ error: `Esta categoría tiene ${n} producto(s). Muévelos a otra antes de borrarla.` }, { status: 409 });
  await sql`delete from categories where id = ${id}`;
  return NextResponse.json({ ok: true });
}
