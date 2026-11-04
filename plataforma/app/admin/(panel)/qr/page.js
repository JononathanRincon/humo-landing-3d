import QRCode from "qrcode";
import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import PrintBtn from "./PrintBtn";
import a from "../../admin.module.css";
export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getSettings();
  const h = headers();
  const base = `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const n = Math.max(0, s.tables || 0);
  const codes = await Promise.all([{ label: "Carta", sub: "Para recoger o domicilio", url: `${base}/carta` },
    ...Array.from({ length: n }, (_, i) => ({ label: `Mesa ${i + 1}`, sub: "Escanea y pide desde tu mesa", url: `${base}/carta?mesa=${i + 1}` }))]
    .map(async c => ({ ...c, svg: await QRCode.toString(c.url, { type: "svg", margin: 1, color: { dark: "#111111", light: "#ffffff" } }) })));
  return (
    <>
      <div className={`${a.pageH} noPrint`}>
        <div><div className="eyebrow">Mesas</div><h1>Códigos QR</h1></div>
        <PrintBtn />
      </div>
      <p className="muted noPrint" style={{ marginTop: -10, marginBottom: 20 }}>Cada mesa tiene su código: el pedido llega indicando el número de mesa. Cambia la cantidad de mesas en Ajustes.</p>
      <div className={a.qrGrid}>
        {codes.map(c => <div key={c.url} className={a.qr}>
          <div dangerouslySetInnerHTML={{ __html: c.svg }} />
          <b>{c.label}</b><span>{s.name} · {c.sub}</span>
        </div>)}
      </div>
    </>
  );
}
