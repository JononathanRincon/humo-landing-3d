import { sql, ready, plain } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { openStatus } from "@/lib/hours";
import Carta from "./Carta";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  await ready();
  const s = await getSettings();
  const categories = plain(await sql`select id, name from categories where active order by position, id`);
  const products = plain(await sql`select p.id, p.category_id, p.name, p.description, p.price, p.image_url, p.extras, p.available, p.featured
    from products p join categories c on c.id = p.category_id where p.active and c.active order by p.position, p.id`);
  const mesa = parseInt(searchParams?.mesa, 10);
  const table = mesa >= 1 && mesa <= (s.tables || 0) ? mesa : null;
  const pub = { name: s.name, tagline: s.tagline, whatsapp: s.whatsapp, address: s.address, currency: s.currency, orders: s.orders, hours: s.hours, media: { hero: s.media.hero } };
  return <Carta s={pub} categories={categories} products={products} status={openStatus(s)} table={table} />;
}
