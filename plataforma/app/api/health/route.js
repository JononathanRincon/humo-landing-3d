import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Estado de la base de datos (sin datos de clientes). Útil para soporte.
export async function GET() {
  const t = Date.now();
  try {
    await ready();
    const [a, b, c] = await Promise.all([
      sql`select count(*)::int as n from products`,
      sql`select count(*)::int as n from categories`,
      sql`select data->>'name' as name from settings where id = 1`
    ]);
    return NextResponse.json({ ok: true, ms: Date.now() - t, productos: a[0].n, categorias: b[0].n, negocio: c[0].name });
  } catch (e) {
    return NextResponse.json({ ok: false, ms: Date.now() - t, error: String(e.message || e).slice(0, 200) }, { status: 500 });
  }
}
