"use client";
import { useEffect, useState } from "react";
import a from "../admin.module.css";

export default function Setup() {
  const [f, setF] = useState({ email: "", password: "", confirm: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/auth/setup").then(r => r.json()).then(j => { if (!j.needsSetup) location.replace("/admin/login"); }).catch(() => {}); }, []);
  async function go(e) {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirm) return setErr("Las contraseñas no coinciden.");
    setBusy(true);
    const r = await fetch("/api/auth/setup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: f.email, password: f.password }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) location.href = "/admin/ajustes"; else { setErr(j.error || "No pudimos crear la cuenta."); setBusy(false); }
  }
  return (
    <div className={a.authWrap}>
      <form className={a.authCard} onSubmit={go}>
        <div className="eyebrow">Primera vez</div>
        <h1>Crea tu acceso</h1>
        <p className="muted" style={{ margin: 0 }}>Esta será la cuenta del dueño del negocio para administrar la carta, los pedidos y la web.</p>
        <div className="field"><label htmlFor="se">Correo</label><input id="se" className="input" type="email" required autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div className="field"><label htmlFor="sp">Contraseña</label><input id="sp" className="input" type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /><span className="hint">Mínimo 8 caracteres.</span></div>
        <div className="field"><label htmlFor="sc">Repite la contraseña</label><input id="sc" className="input" type="password" required minLength={8} autoComplete="new-password" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn btn-solid" disabled={busy}>{busy ? "Creando…" : "Crear cuenta y entrar"}</button>
      </form>
    </div>
  );
}
