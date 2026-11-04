import { NextResponse } from "next/server";
import { sql, ready } from "@/lib/db";
import postgres from "postgres";
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
  await step("sesiones", async () => (await sql`select pid, state, wait_event_type as wt, wait_event as we, extract(epoch from now() - coalesce(xact_start, query_start))::int as seg, left(regexp_replace(query, '\s+', ' ', 'g'), 70) as q
      from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid() and state <> 'idle' order by seg desc limit 15`), out);
  await step("bloqueos", async () => (await sql`select count(*)::int as n from pg_locks where not granted`)[0].n, out);
  if (fix) await step("liberar-viejas", async () => (await sql`select count(pg_terminate_backend(pid))::int as n from pg_stat_activity where datname = current_database() and pid <> pg_backend_pid() and usename = current_user and state <> 'idle' and now() - coalesce(xact_start, query_start) > interval '2 minutes'`)[0].n, out);
  await step("concurrentes (pool actual)", async () => (await Promise.all([1,2,3,4,5].map(i => sql`select ${i}::int as i, pg_sleep(0.05)`))).length, out);
  const np = process.env.POSTGRES_URL_NON_POOLING;
  if (np) {
    const u = new URL(np); for (const k of ["supa", "pgbouncer", "sslmode"]) u.searchParams.delete(k);
    out.push({ nonPooling: { host: u.hostname.replace(/^[^.]+/, "*"), port: u.port } });
    const c = postgres(u.toString(), { ssl: "require", max: 1, prepare: false, connect_timeout: 6, onnotice: () => {} });
    await step("concurrentes (sesión)", async () => (await Promise.all([1,2,3,4,5].map(i => c`select ${i}::int as i, pg_sleep(0.05)`))).length, out);
    c.end({ timeout: 1 }).catch(() => {});
  }
  await step("ready", () => ready().then(() => "ok"), out);
  await step("settings", async () => (await sql`select data->>'name' as n, (data->>'demoVersion') as v from settings where id = 1`)[0] || null, out);
  await step("productos", async () => (await sql`select count(*)::int as n from products`)[0].n, out);
  return NextResponse.json(out);
}
