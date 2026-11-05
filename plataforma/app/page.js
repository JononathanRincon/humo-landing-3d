import { sql, ready, plain } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { openStatus } from "@/lib/hours";
import Landing from "./_c/Landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ready();
  const settings = await getSettings();
  const featured = plain(await sql`select p.id, p.name, p.description, p.price, p.image_url, p.available, p.layers
    from products p left join categories c on c.id = p.category_id
    where p.active and (c.active is null or c.active) and p.featured order by p.position, p.id limit 6`);
  const hero = featured.find(p => (p.layers || []).length) || featured[0] || null;
  return <Landing s={plain([settings])[0]} featured={featured} hero={hero} status={openStatus(settings)} />;
}
