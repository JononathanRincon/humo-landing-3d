"use client";
import { useEffect, useRef, useState } from "react";
import { money, digits } from "@/lib/format";
import s_ from "./landing.module.css";

/* Video de escena: se descarga cuando la escena se acerca y se reproduce, acelerado, cuando está a la vista. */
function SceneVideo({ src, poster, loop, onNearEnd, active, near: soon, rate = 1, label }) {
  const ref = useRef(null);
  const speed = v => { v.defaultPlaybackRate = rate; v.playbackRate = rate; };
  useEffect(() => {
    const v = ref.current; if (!v || !src) return;
    speed(v);
    if (active) { try { v.currentTime = 0; } catch {} v.play().catch(() => {}); } else v.pause();
  }, [active, src, rate]);
  const ending = e => { const v = e.currentTarget; if (v.duration && v.currentTime > v.duration - 1.5 * rate) onNearEnd?.(); };
  if (!src) return <img className={s_.media} src={poster} alt={label} />;
  return <video ref={ref} className={s_.media} src={soon || active ? src : undefined} poster={poster} muted playsInline loop={loop}
    preload={soon || active ? "auto" : "none"} onLoadedMetadata={e => speed(e.currentTarget)} onEnded={onNearEnd} onTimeUpdate={ending} aria-label={label} />;
}

function Chapter({ n, total, title, text, src, poster, loop, label, aside, rate, children }) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [soon, setSoon] = useState(false);
  const [late, setLate] = useState(!src);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { setActive(e.isIntersecting); if (e.isIntersecting) setLate(!src); }, { threshold: .5 });
    // Empieza a descargar el video poco antes de llegar a la escena (solo la siguiente).
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSoon(true); pre.disconnect(); } }, { rootMargin: "0px 0px 60% 0px" });
    if (ref.current) { io.observe(ref.current); pre.observe(ref.current); }
    return () => { io.disconnect(); pre.disconnect(); };
  }, [src]);
  return (
    <section ref={ref} className={s_.chapter} aria-label={title}>
      <div className={s_.frame}><SceneVideo src={src} poster={poster} loop={loop} active={active} near={soon} rate={rate} label={label} onNearEnd={() => setLate(true)} /></div>
      <div className={s_.chapterShade} />
      <div className={`wrap ${s_.chapterText}`}>
        <span className={s_.count}>{n} de {total}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {children}
      </div>
      {aside && <div className={`${s_.aside} ${late && active ? s_.asideOn : ""}`}>{aside}</div>}
    </section>
  );
}

export default function Landing({ s, featured, hero, status }) {
  const m = n => money(n, s.currency);
  const speed = Math.min(3, Math.max(.5, Number(s.videoSpeed) || 1.75));
  const [copied, setCopied] = useState("");
  const wa = `https://wa.me/${digits(s.whatsapp)}`;
  const layers = hero?.layers || [];
  const total = layers.reduce((a, l) => a + (l.grams || 0), 0);
  const today = new Intl.DateTimeFormat("es-CO", { weekday: "long", timeZone: s.timezone || "America/Bogota" }).format(new Date());
  const copy = () => {
    try { navigator.clipboard.writeText(s.whatsapp).then(() => setCopied("Número copiado"), () => setCopied("Mantén presionado el número para copiarlo")); }
    catch { setCopied("Mantén presionado el número para copiarlo"); }
  };
  const statusText = status.open ? `Abierto hasta las ${status.closesAt}` : status.next ? `Cerrado. Abrimos ${status.next.when} a las ${status.next.at}` : "Cerrado por hoy";

  return (
    <main className={s_.page}>
      <header className={s_.top}>
        <div className={`wrap ${s_.topIn}`}>
          <a href="#inicio" className={s_.brand} aria-label={`${s.name}, inicio`}>{s.name}</a>
          <nav className={s_.nav} aria-label="Principal">
            <a href="#carta" className={s_.nl}>Carta</a>
            <a href="#visitanos" className={s_.nl}>Horario</a>
            <a href="/carta" className="btn btn-solid btn-sm">Pedir</a>
          </nav>
        </div>
      </header>

      <section id="inicio" className={s_.hero}>
        <div className={s_.frame}>
          {s.media.v1
            ? <video className={s_.media} src={s.media.v1} poster={s.media.p1 || s.media.hero} autoPlay muted loop playsInline preload="auto" aria-label="Carne sellándose en la parrilla" />
            : <img className={s_.media} src={s.media.hero} alt="" />}
        </div>
        <div className={s_.heroShade} />
        <div className={`wrap ${s_.heroIn}`}>
          <p className={`${s_.status} ${status.open ? s_.open : s_.closed}`}>{statusText}</p>
          <h1 className={s_.h1}>{s.copy.heroTitle}</h1>
          <p className={s_.lead}>{s.copy.heroText}</p>
          <div className={s_.row}>
            <a href="/carta" className="btn btn-solid">Ver la carta y pedir</a>
            <a href="#armado" className={s_.textLink}>Mira cómo se arma</a>
          </div>
        </div>
      </section>

      <div id="armado" />
      <Chapter n={1} total={3} title="El armado" text={s.copy.scene2} rate={speed} src={s.media.v2} poster={s.media.p2 || s.media.hero} label="Los ingredientes caen y se arma la hamburguesa" />
      <Chapter n={2} total={3} title="Por dentro" text={hero ? `${hero.name}: ${s.copy.scene3.charAt(0).toLowerCase()}${s.copy.scene3.slice(1)}` : s.copy.scene3}
        rate={speed} src={s.media.v3} poster={s.media.p3 || s.media.despiece} label="Las capas de la hamburguesa separadas"
        aside={layers.length > 0 && (
          <ol className={s_.layers} aria-label="Ingredientes de arriba hacia abajo">
            {layers.map((l, i) => <li key={i} style={{ transitionDelay: `${i * 50}ms` }}><span>{l.name}</span><span className="leader" /><span>{l.grams} g</span></li>)}
            <li className={s_.tot}><span>En total</span><span className="leader" /><span>{total} g</span></li>
          </ol>)} />
      <Chapter n={3} total={3} title="Servida" text={s.copy.scene4} rate={Math.min(speed, 1.25)} src={s.media.v4} poster={s.media.p4 || s.media.hero} loop label="La hamburguesa girando sobre la pizarra">
        {hero && <div className={s_.serve}>
          <span>{hero.name}</span><span className="leader" /><span className={s_.servePrice}>{m(hero.price)}</span>
        </div>}
        {hero && <a href={`/carta#p-${hero.id}`} className="btn btn-solid" style={{ marginTop: 18 }}>Pedir esta hamburguesa</a>}
      </Chapter>

      <section id="carta" className={s_.band}>
        <div className={`wrap ${s_.bandHead}`}>
          <h2 className={s_.h2}>Las de la casa</h2>
          <a href="/carta" className={s_.textLink}>Ver toda la carta</a>
        </div>
        <div className={s_.shelf}>
          {featured.map(p => (
            <a key={p.id} href={`/carta#p-${p.id}`} className={s_.dish}>
              <div className={s_.dishImg}>{p.image_url ? <img className="melt" src={p.image_url} alt={p.name} loading="lazy" /> : <div className="ph" style={{ height: "100%" }}>{p.name[0]}</div>}</div>
              <div className={s_.dishLine}><h3>{p.name}</h3><span className="leader" /><span className={s_.price}>{m(p.price)}</span></div>
              <p>{p.description}</p>
              {!p.available && <p className={s_.soldout}>Agotada por hoy</p>}
            </a>
          ))}
        </div>
      </section>

      <section id="visitanos" className={s_.band}>
        <div className={`wrap ${s_.visit}`}>
          <div>
            <h2 className={s_.h2}>Ven a la parrilla</h2>
            <p className={s_.addr}>{s.address}</p>
            <ul className={s_.hours} aria-label="Horario">
              {s.hours.map(h => <li key={h.day} className={h.label.toLowerCase() === today.toLowerCase() ? s_.today : ""}>
                <span>{h.label}</span><span className="leader" /><span>{h.closed ? "Cerrado" : `${h.open} a ${h.close}`}</span>
              </li>)}
            </ul>
          </div>
          <div className={s_.order}>
            <h2 className={s_.h2}>O pide a casa</h2>
            <p className={s_.phone}>{s.whatsapp}</p>
            {s.orders.delivery && <p className={s_.muted}>{s.orders.deliveryNote}</p>}
            <div className={s_.row}>
              <a href="/carta" className="btn btn-solid">Hacer un pedido</a>
              <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost">Abrir WhatsApp</a>
              <button type="button" className={s_.textLink} onClick={copy}>Copiar número</button>
            </div>
            <p className="hint" aria-live="polite">{copied}</p>
          </div>
        </div>
      </section>

      <footer className={s_.foot}>
        <div className={`wrap ${s_.footIn}`}>
          <span className={s_.brand}>{s.name}</span>
          <span className={s_.muted}>{s.tagline}, {s.city}</span>
          <a href="/admin" className={s_.muted}>Administración</a>
        </div>
      </footer>
    </main>
  );
}
