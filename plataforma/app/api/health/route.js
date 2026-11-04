import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const step = async (name, fn, out) => {
  const t = Date.now();
  try {
    const r = await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout 8s")), 8000))]);
    out.push({ name, ms: Date.now() - t, ok: true, r });
  } catch (e) { out.push({ name, ms: Date.now() - t, ok: false, error: String(e.message || e).slice(0, 200) }); }
};

// Diagnóstico de la conexión a la base de datos (sin datos de clientes).
export async function GET(req) {
  const out = [];
  const fix = new URL(req.url).searchParams.get("fix") === "1";
  out.push({ node: process.version, region: process.env.VERCEL_REGION || null });
  await step("select 1", async () => (await sql`select 1 as x`)[0].x, out);
  await step("bloqueadas", async () => (await sql`select count(*)::int as n from pg_stat_activity where datname = current_database() and state like 'idle in transaction%' and pid <> pg_backend_pid()`)[0].n, out);
  if (fix) await step("liberar", async () => (await sql`select count(pg_terminate_backend(pid))::int as n from pg_stat_activity where datname = current_database() and state like 'idle in transaction%' and pid <> pg_backend_pid() and usename = current_user`)[0].n, out);
  await step("settings", async () => (await sql`select data->>'name' as n, (data->>'demoVersion') as v from settings where id = 1`)[0] || null, out);
  await step("productos", async () => (await sql`select count(*)::int as n from products`)[0].n, out);
  return NextResponse.json(out);
}
