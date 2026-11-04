import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import { STATUS } from "@/lib/format";
export const runtime = "nodejs";

export async function PATCH(req, { params }) {
  await ready();
  const { status } = await req.json().catch(() => ({}));
  if (!STATUS.some(s => s.id === status)) return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  const [row] = await sql`update orders set status = ${status} where id = ${parseInt(params.id, 10)} returning *`;
  if (!row) return NextResponse.json({ error: "No encontramos ese pedido." }, { status: 404 });
  return NextResponse.json({ order: row });
}
