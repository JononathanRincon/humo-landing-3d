import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  await ready();
  const u = new URL(req.url);
  const status = u.searchParams.get("status");
  const limit = Math.min(200, parseInt(u.searchParams.get("limit") || "80", 10));
  const rows = status && status !== "todos"
    ? (status === "activos"
        ? await sql`select * from orders where status in ('nuevo','preparando','listo') order by created_at desc limit ${limit}`
        : await sql`select * from orders where status = ${status} order by created_at desc limit ${limit}`)
    : await sql`select * from orders order by created_at desc limit ${limit}`;
  const [{ nuevos }] = await sql`select count(*)::int as nuevos from orders where status = 'nuevo'`;
  return NextResponse.json({ orders: rows, nuevos });
}
