"use client";
import { useEffect, useState } from "react";
import { api, uploadFile } from "../../client";
import a from "../../admin.module.css";

const SLOTS = [
  { k: "hero", kind: "image", title: "Foto principal", hint: "La hamburguesa armada. Portada y cuadro inicial de los videos." },
  { k: "despiece", kind: "image", title: "Foto despiezada", hint: "Las capas flotando. Se usa en la escena de anatomía." },
  { k: "v1", kind: "video", title: "Video 1 · La brasa", hint: "Fondo de la portada. Se repite en bucle." },
  { k: "v2", kind: "video", title: "Video 2 · El armado", hint: "Los ingredientes caen y se arma la hamburguesa." },
  { k: "v3", kind: "video", title: "Video 3 · Despiece", hint: "Las capas se separan. Al terminar aparecen los ingredientes." },
  { k: "v4", kind: "video", title: "Video 4 · El giro", hint: "La hamburguesa gira. Cierra la película." }
];

export default function Media() {
  const [media, setMedia] = useState(null);
  const [pct, setPct] = useState({}); const [err, setErr] = useState(""); const [toast, setToast] = useState("");
  useEffect(() => { api("/api/admin/settings").then(j => setMedia(j.settings.media)).catch(e => setErr(e.message)); }, []);
  async function save(next, msg) {
    setMedia(next);
    try { await api("/api/admin/settings", { method: "PUT", body: { media: next } }); setToast(msg); setTimeout(() => setToast(""), 2200); } catch (e) { setErr(e.message); }
  }
  async function pick(slot, e) {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    setErr(""); setPct(p => ({ ...p, [slot.k]: 0 }));
    try {
      const url = await uploadFile(file, { folder: "web", max: 2400, onProgress: v => setPct(p => ({ ...p, [slot.k]: v })) });
      await save({ ...media, [slot.k]: url }, `${slot.title} actualizado`);
    } catch (x) { setErr(x.message); } finally { setPct(p => { const n = { ...p }; delete n[slot.k]; return n; }); }
  }
  if (!media) return <p className="muted">{err || "Cargando…"}</p>;
  return (
    <>
      <div className={a.pageH}><div><div className="eyebrow">Web</div><h1>Fotos y videos</h1></div><a href="/" target="_blank" rel="noopener" className="btn btn-ghost">Ver la web</a></div>
      <p className="muted" style={{ marginTop: -10, marginBottom: 20, maxWidth: "62ch" }}>Sube los videos en formato MP4 horizontal (16:9). Puedes hacerlo desde el celular; si la conexión es lenta, deja la pantalla abierta hasta que termine.</p>
      {err && <p className="err" role="alert">{err}</p>}
      <div className={a.slots}>
        {SLOTS.map(slot => {
          const url = media[slot.k]; const p = pct[slot.k];
          return <div key={slot.k} className={a.slot}>
            <div className={a.slotPrev}>{url ? (slot.kind === "video" ? <video src={url} muted playsInline loop autoPlay preload="metadata" /> : <img src={url} alt="" />) : <div className="ph" style={{ height: "100%", fontSize: "1rem" }}>Sin archivo</div>}</div>
            <div className={a.slotBody}>
              <h3>{slot.title}</h3>
              <span className="hint">{slot.hint}</span>
              {p !== undefined && <div className={a.progress} aria-label={`Subiendo ${p}%`}><span style={{ width: `${p}%` }} /></div>}
              <div className={a.actions} style={{ marginTop: "auto" }}>
                <label className="btn btn-solid btn-sm">{p !== undefined ? `Subiendo ${p}%` : url ? "Reemplazar" : "Subir"}
                  <input type="file" hidden accept={slot.kind === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*"} disabled={p !== undefined} onChange={e => pick(slot, e)} /></label>
                {url && slot.kind === "video" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => save({ ...media, [slot.k]: "" }, `${slot.title} quitado`)}>Quitar</button>}
              </div>
            </div>
          </div>;
        })}
      </div>
      {toast && <div className={a.toast} role="status">{toast}</div>}
    </>
  );
}
