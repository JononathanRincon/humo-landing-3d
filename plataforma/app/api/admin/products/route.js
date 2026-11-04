import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import { cleanProduct } from "./clean";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await ready();
  const products = await sql`select * from products order by position, id`;
  const categories = await sql`select * from categories order by position, id`;
  return NextResponse.json({ products, categories });
}

export async function POST(req) {
  await ready();
  const p = cleanProduct(await req.json().catch(() => ({})));
  if (p.error) return NextResponse.json({ error: p.error }, { status: 400 });
  const [{ pos }] = await sql`select coalesce(max(position), -1) + 1 as pos from products`;
  const [row] = await sql`insert into products (category_id, name, description, price, image_url, extras, layers, available, active, featured, position)
    values (${p.category_id}, ${p.name}, ${p.description}, ${p.price}, ${p.image_url}, ${sql.json(p.extras)}, ${sql.json(p.layers)}, ${p.available}, ${p.active}, ${p.featured}, ${pos})
    returning *`;
  return NextResponse.json({ product: row });
}
