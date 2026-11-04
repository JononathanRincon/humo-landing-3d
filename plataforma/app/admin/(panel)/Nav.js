"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import a from "../admin.module.css";

const LINKS = [
  ["/admin", "Resumen", "◎"], ["/admin/pedidos", "Pedidos", "▤"], ["/admin/productos", "Carta", "☰"],
  ["/admin/medios", "Web", "▶"], ["/admin/qr", "QR", "▦"], ["/admin/ajustes", "Ajustes", "⚙"]
];

function beep() {
  try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = .08; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + .25); } catch {}
}

export default function Nav({ name }) {
  const path = usePathname();
  const [nuevos, setNuevos] = useState(0);
  const prev = useRef(null);
  useEffect(() => {
    let t;
    const tick = async () => {
      try {
        const j = await fetch("/api/admin/orders?status=nuevo&limit=1").then(r => r.json());
        if (typeof j.nuevos === "number") {
          if (prev.current !== null && j.nuevos > prev.current) { beep(); try { navigator.vibrate?.(200); } catch {} document.title = `(${j.nuevos}) Pedidos nuevos`; }
          prev.current = j.nuevos; setNuevos(j.nuevos);
        }
      } catch {}
      t = setTimeout(tick, 20000);
    };
    tick(); return () => clearTimeout(t);
  }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/admin/login"; }
  return (
    <nav className={a.side} aria-label="Panel">
      <a href="/admin" className={a.sideBrand}>{name}<small>Administración</small></a>
      {LINKS.map(([href, label, ico]) => {
        const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return <a key={href} href={href} className={`${a.navA} ${on ? a.navOn : ""}`} aria-current={on ? "page" : undefined}>
          <span className={a.ico} aria-hidden="true">{ico}</span><span>{label}</span>
          {href === "/admin/pedidos" && nuevos > 0 && <span className={a.cnt}>{nuevos}</span>}
        </a>;
      })}
      <div className={a.sideFoot}>
        <a href="/" target="_blank" rel="noopener" className="btn btn-ghost btn-sm">Ver la web</a>
        <a href="/carta" target="_blank" rel="noopener" className="btn btn-ghost btn-sm">Ver la carta</a>
        <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}
