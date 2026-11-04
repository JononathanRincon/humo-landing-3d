import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
export const runtime = "nodejs";

export async function POST(req) {
  await ready();
  const { name } = await req.json().catch(() => ({}));
  const n = String(name || "").trim().slice(0, 40);
  if (!n) return NextResponse.json({ error: "La categoría necesita un nombre." }, { status: 400 });
  const [{ pos }] = await sql`select coalesce(max(position), -1) + 1 as pos from categories`;
  const [row] = await sql`insert into categories (name, position) values (${n}, ${pos}) returning *`;
  return NextResponse.json({ category: row });
}
