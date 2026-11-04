import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import { getSettings } from "@/lib/settings";
export const runtime = "nodejs";

export async function POST(req) {
  try {
    await ready();
    const { productId, page } = await req.json();
    const tz = (await getSettings()).timezone || "America/Bogota";
    if (page) await sql`insert into page_views (day, views) values ((now() at time zone ${tz})::date, 1) on conflict (day) do update set views = page_views.views + 1`;
    const id = parseInt(productId, 10);
    if (id) await sql`insert into product_views (product_id, day, views) select ${id}, (now() at time zone ${tz})::date, 1 where exists (select 1 from products where id = ${id})
      on conflict (product_id, day) do update set views = product_views.views + 1`;
  } catch {}
  return new NextResponse(null, { status: 204 });
}
