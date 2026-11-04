"use client";
import { useEffect, useState } from "react";
import { api } from "../../client";
import a from "../../admin.module.css";

const ACCENTS = ["#f2a03d", "#e9c54a", "#ec5b3c", "#7cc9a6", "#f39cbf", "#8fb3ff"];

export default function Settings() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState(""); const [toast, setToast] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { api("/api/admin/settings").then(j => setS(j.settings)).catch(e => setErr(e.message)); }, []);
  if (!s) return <p className="muted">{err || "Cargando…"}</p>;
  const set = (k, v) => setS(x => ({ ...x, [k]: v }));
  const setIn = (k, sub, v) => setS(x => ({ ...x, [k]: { ...x[k], [sub]: v } }));
  const setHour = (i, k, v) => setS(x => ({ ...x, hours: x.hours.map((h, j) => j === i ? { ...h, [k]: v } : h) }));

  async function save(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const body = { ...s, orders: { ...s.orders, deliveryFee: Number(s.orders.deliveryFee) || 0, minOrder: Number(s.orders.minOrder) || 0 } };
      const j = await api("/api/admin/settings", { method: "PUT", body }); setS(j.settings);
      setToast("Ajustes guardados"); setTimeout(() => setToast(""), 2200);
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/admin/login"; }

  return (
    <form onSubmit={save}>
      <div className={a.pageH}>
        <div><div className="eyebrow">Ajustes</div><h1>Tu negocio</h1></div>
        <button className="btn btn-solid" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button>
      </div>
      <div className={a.form}>
        <section className={a.card}>
          <h2>Datos del negocio</h2>
          <div className={a.form}>
            <div className={a.row2}>
              <div className="field"><label htmlFor="sn">Nombre</label><input id="sn" className="input" required maxLength={30} value={s.name} onChange={e => set("name", e.target.value)} /></div>
              <div className="field"><label htmlFor="st">Eslogan</label><input id="st" className="input" maxLength={60} value={s.tagline} onChange={e => set("tagline", e.target.value)} /></div>
            </div>
            <div className={a.row2}>
              <div className="field"><label htmlFor="sw">WhatsApp donde llegan los pedidos</label><input id="sw" className="input" type="tel" required value={s.whatsapp} onChange={e => set("whatsapp", e.target.value)} /><span className="hint">Con indicativo del país, por ejemplo +57 300 123 4567.</span></div>
              <div className="field"><label htmlFor="sc">Ciudad</label><input id="sc" className="input" value={s.city} onChange={e => set("city", e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="sa">Dirección</label><input id="sa" className="input" value={s.address} onChange={e => set("address", e.target.value)} /></div>
            <div className="field"><span className="lbl">Color de la marca</span>
              <div className={a.swatches}>
                {ACCENTS.map(c => <button key={c} type="button" className={`${a.sw} ${s.accent === c ? a.swOn : ""}`} style={{ background: c }} aria-label={`Color ${c}`} aria-pressed={s.accent === c} onClick={() => set("accent", c)} />)}
                <input type="color" aria-label="Otro color" value={s.accent} onChange={e => set("accent", e.target.value)} style={{ width: 44, height: 36, background: "none", border: 0 }} />
              </div></div>
          </div>
        </section>

        <section className={a.card}>
          <h2>Horario de atención</h2>
          <p className="hint" style={{ marginTop: -6 }}>La carta muestra “Abierto” o “Cerrado” y no deja enviar pedidos fuera de este horario.</p>
          <div style={{ overflowX: "auto" }}>
            <table className={a.hoursT}><tbody>
              {s.hours.map((h, i) => <tr key={h.day}>
                <td style={{ minWidth: 92 }}>{h.label}</td>
                <td><input className="input num" type="time" aria-label={`${h.label} abre`} disabled={h.closed} value={h.open} onChange={e => setHour(i, "open", e.target.value)} /></td>
                <td><input className="input num" type="time" aria-label={`${h.label} cierra`} disabled={h.closed} value={h.close} onChange={e => setHour(i, "close", e.target.value)} /></td>
                <td><label style={{ display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}><span className="toggle"><input type="checkbox" checked={!h.closed} onChange={e => setHour(i, "closed", !e.target.checked)} /><span /></span>{h.closed ? "Cerrado" : "Abre"}</label></td>
              </tr>)}
            </tbody></table>
          </div>
        </section>

        <section className={a.card}>
          <h2>Pedidos</h2>
          <div className={a.checks}>
            <label className={a.checkRow}><span>Recibir pedidos en línea<small>Apágalo para pausar los pedidos sin cerrar la carta.</small></span><span className="toggle"><input type="checkbox" checked={s.orders.enabled} onChange={e => setIn("orders", "enabled", e.target.checked)} /><span /></span></label>
            <label className={a.checkRow}><span>Para recoger en el local</span><span className="toggle"><input type="checkbox" checked={s.orders.pickup} onChange={e => setIn("orders", "pickup", e.target.checked)} /><span /></span></label>
            <label className={a.checkRow}><span>Domicilios</span><span className="toggle"><input type="checkbox" checked={s.orders.delivery} onChange={e => setIn("orders", "delivery", e.target.checked)} /><span /></span></label>
          </div>
          {s.orders.delivery && <div className={a.form} style={{ marginTop: 14 }}>
            <div className={a.row2}>
              <div className="field"><label htmlFor="df">Costo del domicilio</label><input id="df" className="input num" inputMode="numeric" value={s.orders.deliveryFee} onChange={e => setIn("orders", "deliveryFee", e.target.value.replace(/\D/g, ""))} /></div>
              <div className="field"><label htmlFor="dm">Pedido mínimo</label><input id="dm" className="input num" inputMode="numeric" value={s.orders.minOrder} onChange={e => setIn("orders", "minOrder", e.target.value.replace(/\D/g, ""))} /></div>
            </div>
            <div className="field"><label htmlFor="dn">Texto de cobertura</label><input id="dn" className="input" maxLength={120} value={s.orders.deliveryNote} onChange={e => setIn("orders", "deliveryNote", e.target.value)} /></div>
          </div>}
          <div className="field" style={{ marginTop: 14 }}><label htmlFor="tb">Número de mesas</label><input id="tb" className="input num" inputMode="numeric" style={{ maxWidth: 160 }} value={s.tables} onChange={e => set("tables", e.target.value.replace(/\D/g, ""))} /><span className="hint">Genera un QR por mesa en la sección QR.</span></div>
        </section>

        <section className={a.card}>
          <h2>Textos de la web</h2>
          <div className={a.form}>
            {[["heroTitle", "Título principal", 40], ["heroText", "Texto de bienvenida", 160], ["scene2", "Escena: el armado", 120], ["scene3", "Escena: anatomía", 120], ["scene4", "Escena: servida", 120]].map(([k, l, n]) => (
              <div className="field" key={k}><label htmlFor={`c-${k}`}>{l}</label><input id={`c-${k}`} className="input" maxLength={n} value={s.copy[k]} onChange={e => setIn("copy", k, e.target.value)} /></div>
            ))}
          </div>
        </section>
        {err && <p className="err" role="alert">{err}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
          <button className="btn btn-solid" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button>
        </div>
      </div>
      {toast && <div className={a.toast} role="status">{toast}</div>}
    </form>
  );
}
