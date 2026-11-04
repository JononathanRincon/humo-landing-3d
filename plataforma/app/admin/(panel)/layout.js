import { getSettings } from "@/lib/settings";
import Nav from "./Nav";
import a from "../admin.module.css";
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }) {
  const s = await getSettings();
  return (
    <div className={a.shell}>
      <Nav name={s.name} />
      <main className={a.main}>
        <div className={a.mTop}><b style={{ fontFamily: "var(--f-display)", fontSize: "1.4rem", letterSpacing: ".06em" }}>{s.name}</b><a href="/" target="_blank" rel="noopener" className="btn btn-ghost btn-sm">Ver web</a></div>
        {children}
      </main>
    </div>
  );
}
