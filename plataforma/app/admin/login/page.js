"use client";
import { useEffect, useState } from "react";
import a from "../admin.module.css";

export default function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/auth/setup").then(r => r.json()).then(j => { if (j.needsSetup) location.replace("/admin/setup"); }).catch(() => {}); }, []);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) location.href = "/admin"; else { setErr(j.error || "No pudimos iniciar sesión."); setBusy(false); }
  }
  return (
    <div className={a.authWrap}>
      <form className={a.authCard} onSubmit={go}>
        <div className="eyebrow">Panel de administración</div>
        <h1>Iniciar sesión</h1>
        <div className="field"><label htmlFor="le">Correo</label><input id="le" className="input" type="email" required autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></div>
        <div className="field"><label htmlFor="lp">Contraseña</label><input id="lp" className="input" type="password" required autoComplete="current-password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn btn-solid" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
        <a href="/" className="hint" style={{ textAlign: "center" }}>Volver a la web</a>
      </form>
    </div>
  );
}
