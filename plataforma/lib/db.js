import postgres from "postgres";
import { SEED_CATEGORIES, SEED_PRODUCTS, DEMO_IMAGES, DEMO_VERSION } from "./seed";
import { DEFAULT_SETTINGS } from "./defaults";

const g = globalThis;

function client() {
  // Pooler en modo transacción (no reserva conexiones entre peticiones). Para que no mezcle
  // respuestas, cada instancia envía una sola consulta a la vez (ver la cola más abajo).
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!raw) throw new Error("Falta la variable DATABASE_URL");
  if (!g.__sql) {
    // Quita parámetros propios de Vercel/Supabase que Postgres no reconoce.
    const u = new URL(raw); for (const k of ["supa", "pgbouncer", "sslmode", "connection_limit"]) u.searchParams.delete(k);
    const url = u.toString();
    const local = /localhost|127\.0\.0\.1/.test(url);
    g.__sql = postgres(url, {
      ssl: local ? false : "require",
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
      onnotice: () => {},
      prepare: false // compatible con el pooler de Supabase
    });
  }
  return g.__sql;
}

// Cola: las consultas de esta instancia se ejecutan una detrás de otra.
let queue = Promise.resolve();
const isTemplate = a => Array.isArray(a) && Array.isArray(a.raw);
export const sql = new Proxy(function () {}, {
  apply: (_t, _this, args) => {
    if (!isTemplate(args[0])) return client()(...args); // ayudantes como sql(objeto, ...columnas)
    const run = queue.then(() => client()(...args));
    queue = run.catch(() => {});
    return run;
  },
  get: (_t, prop) => client()[prop]
});

const SCHEMA = `
create table if not exists settings (id int primary key default 1, data jsonb not null default '{}'::jsonb);
create table if not exists admins (
  id serial primary key, email text unique not null, password_hash text not null,
  created_at timestamptz not null default now());
create table if not exists categories (
  id serial primary key, name text not null, position int not null default 0, active boolean not null default true);
create table if not exists products (
  id serial primary key,
  category_id int references categories(id) on delete set null,
  name text not null, description text not null default '',
  price int not null default 0, image_url text,
  extras jsonb not null default '[]'::jsonb,
  layers jsonb not null default '[]'::jsonb,
  available boolean not null default true,
  active boolean not null default true,
  featured boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now());
create table if not exists orders (
  id serial primary key,
  created_at timestamptz not null default now(),
  status text not null default 'nuevo',
  type text not null,
  table_no int,
  customer_name text not null,
  customer_phone text,
  address text,
  notes text,
  items jsonb not null,
  subtotal int not null,
  delivery_fee int not null default 0,
  total int not null);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);
create table if not exists product_views (
  product_id int not null references products(id) on delete cascade,
  day date not null, views int not null default 0,
  primary key (product_id, day));
create table if not exists page_views (day date primary key, views int not null default 0);
`;

export async function ready() {
  if (!g.__dbReady) {
    g.__dbReady = (async () => {
      const db = sql;
      // Crear tablas solo la primera vez: evita bloqueos en cada arranque en frío.
      const [{ ok }] = await db`select to_regclass('public.page_views') is not null as ok`;
      if (!ok) await client().unsafe(SCHEMA);
      await db`insert into settings (id, data) values (1, ${db.json(DEFAULT_SETTINGS)}) on conflict (id) do nothing`;
      const [{ n }] = await db`select count(*)::int as n from categories`;
      if (n === 0) {
        const ids = {};
        for (const [i, c] of SEED_CATEGORIES.entries()) {
          const [row] = await db`insert into categories (name, position) values (${c}, ${i}) returning id`;
          ids[c] = row.id;
        }
        for (const [i, p] of SEED_PRODUCTS.entries()) {
          await db`insert into products (category_id, name, description, price, image_url, extras, layers, featured, position)
            values (${ids[p.category]}, ${p.name}, ${p.description}, ${p.price}, ${p.image || null},
                    ${db.json(p.extras || [])}, ${db.json(p.layers || [])}, ${!!p.featured}, ${i})`;
        }
      }
      // Contenido de la demo: completa fotos y videos que falten sin tocar lo que el dueño ya subió.
      const [{ data }] = await db`select data from settings where id = 1`;
      if ((data.demoVersion || 0) < DEMO_VERSION) {
        for (const [name, url] of Object.entries(DEMO_IMAGES))
          await db`update products set image_url = ${url} where name = ${name} and (image_url is null or image_url = '' or image_url = '/media/hero.webp')`;
        const media = { ...DEFAULT_SETTINGS.media, ...Object.fromEntries(Object.entries(data.media || {}).filter(([, v]) => v)) };
        const accent = !data.accent || data.accent === "#f2a03d" ? DEFAULT_SETTINGS.accent : data.accent;
        await db`update settings set data = ${db.json({ ...data, media, accent, demoVersion: DEMO_VERSION })} where id = 1`;
      }
    })().catch(e => { g.__dbReady = null; throw e; });
  }
  return g.__dbReady;
}

// Convierte resultados de la base de datos en objetos simples para pasarlos a componentes del navegador.
export const plain = rows => JSON.parse(JSON.stringify(Array.from(rows || [])));
