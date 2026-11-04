import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import { cleanProduct } from "../clean";
export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  await ready();
  const p = cleanProduct(await req.json().catch(() => ({})), true);
  if (p.error) return NextResponse.json({ error: p.error }, { status: 400 });
  const keys = Object.keys(p);
  if (!keys.length) return NextResponse.json({ error: "No hay cambios." }, { status: 400 });
  const vals = { ...p };
  if (vals.extras) vals.extras = sql.json(vals.extras);
  if (vals.layers) vals.layers = sql.json(vals.layers);
  const [row] = await sql`update products set ${sql(vals, ...keys)}, updated_at = now() where id = ${parseInt(params.id, 10)} returning *`;
  if (!row) return NextResponse.json({ error: "No encontramos ese producto." }, { status: 404 });
  return NextResponse.json({ product: row });
}

export async function DELETE(_req, { params }) {
  await ready();
  await sql`delete from products where id = ${parseInt(params.id, 10)}`;
  return NextResponse.json({ ok: true });
}
