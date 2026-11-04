import { getSettings } from "@/lib/settings";
import Products from "./Products";
export const dynamic = "force-dynamic";
export default async function Page() { const s = await getSettings(); return <Products currency={s.currency} />; }
