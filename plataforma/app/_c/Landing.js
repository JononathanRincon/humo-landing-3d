"use client";
import { useEffect, useRef, useState } from "react";
import { money, digits } from "@/lib/format";
import s_ from "./landing.module.css";

function SceneVideo({ src, poster, loop, onEnd, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current; if (!v || !src) return;
    if (active) { try { v.currentTime = 0; } catch {} v.play().catch(() => {}); } else v.pause();
  }, [active, src]);
  if (!src) return <img className={s_.media} src={poster} alt="" />;
  return <video ref={ref} className={s_.media} src={active ? src : undefined} poster={poster} muted playsInline loop={loop} preload="none" onEnded={onEnd} />;
}

function Scene({ n, title, text, src, poster, loop, children, side }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [ended, setEnded] = useState(!src);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { setActive(e.isIntersecting); if (e.isIntersecting) setEnded(!src); }, { threshold: .55 });
    ref.current && io.observe(ref.current);
    return () => io.disconnect();
  }, [src]);
  return (
    <section ref={ref} className={s_.scene}>
      <div className={s_.sceneMedia}><SceneVideo src={src} poster={poster} loop={loop} active={active} onEnd={() => setEnded(true)} /></div>
      <div className={s_.shade} />
      <div className={`${s_.bar} ${s_.barT}`}><span className="mono"><i className={s_.rec} /> Escena {n}</span><span className="mono muted">{title}</span></div>
      <div className={`${s_.cap} ${active ? s_.on : ""}`}>
        <div className="eyebrow">Escena {n}</div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {side && <div className={`${s_.side} ${active && ended ? s_.on : ""}`}>{side}</div>}
      {children}
      <div className={`${s_.bar} ${s_.barB}`} />
    </section>
  );
}

export default function Landing({ s, featured, hero, status }) {
  const m = n => money(n, s.currency);
  const [copied, setCopied] = useState("");
  const wa = `https://wa.me/${digits(s.whatsapp)}`;
  const layers = hero?.layers || [];
  const total = layers.reduce((a, l) => a + (l.grams || 0), 0);
  const copy = () => {
    try { navigator.clipboard.writeText(s.whatsapp).then(() => setCopied("Número copiado"), () => setCopied("Mantén presionado para copiar")); }
    catch { setCopied("Mantén presionado para copiar"); }
  };
  return (
    <main className={s_.page}>
      <header className={s_.top}>
        <div className={`wrap ${s_.topIn}`}>
          <a href="#inicio" className={s_.brand}>{s.name}<small>{s.tagline}</small></a>
          <nav className={s_.nav}>
            <a href="#carta" className={s_.nl}>Carta</a>
            <a href="#visitanos" className={s_.nl}>Visítanos</a>
            <a href="/carta" className="btn btn-solid btn-sm">Pedir</a>
          </nav>
        </div>
      </header>

      <section id="inicio" className={s_.hero}>
        <div className={s_.sceneMedia}>
          {s.media.v1
            ? <video className={s_.media} src={s.media.v1} poster={s.media.hero} autoPlay muted loop playsInline preload="auto" />
            : <img className={`${s_.media} ${s_.kb}`} src={s.media.hero} alt={hero ? `Hamburguesa ${hero.name}` : ""} />}
        </div>
        <div className={s_.heroShade} />
        <div className={`wrap ${s_.heroIn}`}>
          <span className={`pill ${status.open ? "ok" : "bad"}`}>{status.open ? `Abierto · hasta ${status.closesAt}` : status.next ? `Cerrado · abre ${status.next.when} ${status.next.at}` : "Cerrado"}</span>
          <h1 className={s_.h1}>{s.copy.heroTitle}</h1>
          <p className={s_.lead}>{s.copy.heroText}</p>
          <div className={s_.row}>
            <a href="/carta" className="btn btn-solid">Ver la carta y pedir</a>
            <a href="#escena-02" className="btn btn-ghost">Mira cómo se arma</a>
          </div>
        </div>
      </section>

      <div id="escena-02" />
      <Scene n="01" title="El armado" text={s.copy.scene2} src={s.media.v2} poster={s.media.hero} />
      <Scene n="02" title="Anatomía" text={hero ? `${hero.name}: ${s.copy.scene3.toLowerCase()}` : s.copy.scene3} src={s.media.v3} poster={s.media.despiece}
        side={layers.length > 0 && (
          <ol className={s_.layers} aria-label="Ingredientes de arriba hacia abajo">
            {layers.map((l, i) => <li key={i} style={{ transitionDelay: `${i * 60}ms` }}><span>{l.name}</span><span className="num">{l.grams} g</span></li>)}
            <li className={s_.tot}><span>Total</span><span className="num">{total} g</span></li>
          </ol>)} />
      <Scene n="03" title="Servida" text={s.copy.scene4} src={s.media.v4} poster={s.media.hero} loop>
        {hero && <div className={s_.cta}>
          <h3>{hero.name}</h3>
          <div className={`${s_.price} num`}>{m(hero.price)}</div>
          <a href={`/carta#p-${hero.id}`} className="btn btn-solid">Pedir la {hero.name}</a>
        </div>}
      </Scene>

      <section id="carta" className={s_.band}>
        <div className="wrap">
          <div className="eyebrow">La carta</div>
          <h2 className={s_.h2}>Las de la casa</h2>
          <div className={s_.grid}>
            {featured.map(p => (
              <a key={p.id} href={`/carta#p-${p.id}`} className={s_.card}>
                <div className={s_.cardImg}>{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" /> : <div className="ph" style={{ height: "100%" }}>{p.name[0]}</div>}</div>
                <div className={s_.cardBody}>
                  <div className={s_.cardTop}><h3>{p.name}</h3><span className="num">{m(p.price)}</span></div>
                  <p>{p.description}</p>
                  {!p.available && <span className="pill bad">Agotada hoy</span>}
                </div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 28 }}><a href="/carta" className="btn btn-solid">Ver toda la carta</a></div>
        </div>
      </section>

      <section id="visitanos" className={s_.band}>
        <div className={`wrap ${s_.visit}`}>
          <div>
            <div className="eyebrow">Visítanos</div>
            <h2 className={s_.h2}>{s.address}</h2>
            <table className={s_.hours}><tbody>
              {s.hours.map(h => <tr key={h.day}><td>{h.label}</td><td className="num">{h.closed ? "Cerrado" : `${h.open} – ${h.close}`}</td></tr>)}
            </tbody></table>
          </div>
          <div>
            <div className="eyebrow">Domicilios por WhatsApp</div>
            <div className={`${s_.phone} num`}>{s.whatsapp}</div>
            <div className={s_.row}>
              <a href="/carta" className="btn btn-solid">Hacer un pedido</a>
              <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost">Abrir WhatsApp</a>
              <button type="button" className="btn btn-ghost" onClick={copy}>Copiar número</button>
            </div>
            <p className="hint" aria-live="polite">{copied}</p>
            {s.orders.delivery && <p className="muted">{s.orders.deliveryNote}</p>}
          </div>
        </div>
      </section>

      <footer className={s_.foot}>
        <div className={`wrap ${s_.footIn}`}>
          <span><b>{s.name}</b> · {s.city}</span>
          <a href="/admin" className="muted">Administración</a>
        </div>
      </footer>
    </main>
  );
}
