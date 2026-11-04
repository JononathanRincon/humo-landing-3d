import { getSettings } from "@/lib/settings";
import Orders from "./Orders";
export const dynamic = "force-dynamic";
export default async function Page() { const s = await getSettings(); return <Orders currency={s.currency} />; }
