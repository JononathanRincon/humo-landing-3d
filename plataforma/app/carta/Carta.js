"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { money } from "@/lib/format";
import c from "./carta.module.css";

const KEY = "carta-pedido";
const lineKey = (id, extras, note) => `${id}|${[...extras].sort().join(",")}|${note || ""}`;

export default function Carta({ s, categories, products, status, table }) {
  const m = n => money(n, s.currency);
  const [cart, setCart] = useState([]);
  const [sheet, setSheet] = useState(null);        // producto abierto
  const [view, setView] = useState(null);          // 'cart' | 'checkout' | 'done'
  const [active, setActive] = useState(categories[0]?.id);
  const [done, setDone] = useState(null);
  const chipsRef = useRef(null);
  const canOrder = s.orders.enabled && status.open;

  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(v)) setCart(v); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ page: true }) }).catch(() => {}); }, []);
  useEffect(() => {
    const id = parseInt((location.hash || "").replace("#p-", ""), 10);
    const p = products.find(x => x.id === id); if (p) setTimeout(() => openProduct(p), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const secs = categories.map(cat => document.getElementById(`cat-${cat.id}`)).filter(Boolean);
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setActive(+e.target.dataset.id); }); }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(x => io.observe(x)); return () => io.disconnect();
  }, [categories]);
  useEffect(() => { const el = chipsRef.current?.querySelector(`[data-id="${active}"]`); el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); }, [active]);
  useEffect(() => { document.body.style.overflow = sheet || view ? "hidden" : ""; }, [sheet, view]);

  const byCat = useMemo(() => categories.map(cat => ({ ...cat, items: products.filter(p => p.category_id === cat.id) })).filter(x => x.items.length), [categories, products]);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const subtotal = cart.reduce((a, l) => a + l.unit * l.qty, 0);

  function openProduct(p) {
    setSheet(p);
    fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId: p.id }) }).catch(() => {});
  }
  function add(p, extras, qty, note) {
    const unit = p.price + (p.extras || []).filter(e => extras.includes(e.name)).reduce((a, e) => a + e.price, 0);
    const k = lineKey(p.id, extras, note);
    setCart(cur => { const i = cur.findIndex(l => l.k === k); if (i >= 0) { const n = [...cur]; n[i] = { ...n[i], qty: n[i].qty + qty }; return n; } return [...cur, { k, id: p.id, name: p.name, image: p.image_url, extras, note, unit, qty }]; });
    setSheet(null);
  }
  const setQty = (k, q) => setCart(cur => q <= 0 ? cur.filter(l => l.k !== k) : cur.map(l => l.k === k ? { ...l, qty: Math.min(20, q) } : l));

  return (
    <div className={c.app}>
      <header className={c.head}>
        <div className={c.headIn}>
          <a href="/" className={c.brand}>{s.name}</a>
          <div className={c.headR}>
            {table && <span className={c.table}>Mesa {table}</span>}
            <span className={`${c.status} ${status.open ? c.open : c.shut}`}>{status.open ? "Abierto" : "Cerrado"}</span>
          </div>
        </div>
        <nav className={c.chips} ref={chipsRef} aria-label="Categorías">
          {byCat.map(cat => <a key={cat.id} data-id={cat.id} href={`#cat-${cat.id}`} className={`${c.chip} ${active === cat.id ? c.chipOn : ""}`}>{cat.name}</a>)}
        </nav>
      </header>

      <div className={c.intro}>
        <h1>La carta</h1>
        <p className={c.sub}>{table ? `Estás en la mesa ${table}. Elige y te lo llevamos.` : "Elige, arma tu pedido y lo recibimos por WhatsApp."}</p>
        {!status.open && <p className={c.closed}>{status.next ? `Estamos cerrados. Abrimos ${status.next.when} a las ${status.next.at}. Puedes ver la carta y armar tu pedido.` : "Estamos cerrados en este momento."}</p>}
        {status.open && !s.orders.enabled && <p className={c.closed}>Los pedidos en línea están pausados. Puedes ver la carta.</p>}
      </div>

      <main className={c.list}>
        {byCat.map(cat => (
          <section key={cat.id} id={`cat-${cat.id}`} data-id={cat.id} className={c.cat}>
            <h2>{cat.name}</h2>
            <div className={c.items}>
              {cat.items.map(p => (
                <button key={p.id} id={`p-${p.id}`} type="button" className={`${c.item} ${!p.available ? c.off : ""}`} onClick={() => openProduct(p)}>
                  <div className={c.itemImg}>{p.image_url ? <img className="melt" src={p.image_url} alt="" loading="lazy" /> : <div className="ph" style={{ height: "100%" }}>{p.name[0]}</div>}</div>
                  <div className={c.itemTxt}>
                    <div className={c.itemLine}><h3>{p.name}</h3><span className="leader" /><span className={c.price}>{m(p.price)}</span></div>
                    <p>{p.description}</p>
                    {!p.available ? <span className={c.soldout}>Agotado por hoy</span> : p.featured && <span className={c.house}>De la casa</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
        <p className={c.addr}>{s.address}</p>
      </main>

      {count > 0 && !view && (
        <button type="button" className={c.bar} onClick={() => setView("cart")}>
          <span className={c.badge}>{count}</span><span>Ver mi pedido</span><span className="num">{m(subtotal)}</span>
        </button>
      )}

      {sheet && <ProductSheet p={sheet} m={m} canOrder={canOrder} onClose={() => setSheet(null)} onAdd={add} />}
      {view && <Checkout {...{ s, m, cart, setQty, subtotal, table, canOrder, status, view, setView, setCart, done, setDone }} />}
    </div>
  );
}

function Sheet({ onClose, children, label }) {
  useEffect(() => { const k = e => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className={c.overlay} onClick={onClose}>
      <div className={c.sheet} role="dialog" aria-modal="true" aria-label={label} onClick={e => e.stopPropagation()}>
        <button type="button" className={c.x} onClick={onClose} aria-label="Cerrar">×</button>
        {children}
      </div>
    </div>
  );
}

function ProductSheet({ p, m, canOrder, onClose, onAdd }) {
  const [extras, setExtras] = useState([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const unit = p.price + (p.extras || []).filter(e => extras.includes(e.name)).reduce((a, e) => a + e.price, 0);
  const toggle = n => setExtras(x => x.includes(n) ? x.filter(y => y !== n) : [...x, n]);
  return (
    <Sheet onClose={onClose} label={p.name}>
      <div className={c.sheetImg}>{p.image_url ? <img className="melt" src={p.image_url} alt={p.name} /> : <div className="ph" style={{ height: "100%" }}>{p.name[0]}</div>}</div>
      <div className={c.sheetBody}>
        <h2>{p.name}</h2>
        <p className="muted">{p.description}</p>
        <div className={`${c.big} num`}>{m(p.price)}</div>
        {!p.available ? <p className={c.closed}>Este producto se agotó por hoy.</p> : <>
          {(p.extras || []).length > 0 && <fieldset className={c.extras}>
            <legend className={c.legend}>Adiciones</legend>
            {p.extras.map(e => (
              <label key={e.name} className={c.extra}>
                <input type="checkbox" checked={extras.includes(e.name)} onChange={() => toggle(e.name)} />
                <span>{e.name}</span><span className="num muted">+ {m(e.price)}</span>
              </label>
            ))}
          </fieldset>}
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="pnote">Indicaciones (opcional)</label>
            <input id="pnote" className="input" maxLength={120} placeholder="Ej.: sin cebolla, término medio" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className={c.addRow}>
            <div className={c.stepper}>
              <button type="button" aria-label="Quitar uno" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="num" aria-live="polite">{qty}</span>
              <button type="button" aria-label="Agregar uno" onClick={() => setQty(q => Math.min(20, q + 1))}>+</button>
            </div>
            <button type="button" className="btn btn-solid" style={{ flex: 1 }} onClick={() => onAdd(p, extras, qty, note.trim())}>
              Agregar · <span className="num">{m(unit * qty)}</span>
            </button>
          </div>
          {!canOrder && <p className="hint" style={{ marginTop: 10 }}>Puedes armar tu pedido; lo envías cuando estemos abiertos.</p>}
        </>}
      </div>
    </Sheet>
  );
}

function Checkout({ s, m, cart, setQty, subtotal, table, canOrder, status, view, setView, setCart, done, setDone }) {
  const types = table ? ["mesa"] : [s.orders.pickup && "recoger", s.orders.delivery && "domicilio"].filter(Boolean);
  const [f, setF] = useState(() => { let saved = {}; try { saved = JSON.parse(localStorage.getItem("carta-cliente") || "{}"); } catch {} return { type: types[0], name: saved.name || "", phone: saved.phone || "", address: saved.address || "", notes: "" }; });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const fee = f.type === "domicilio" ? (s.orders.deliveryFee || 0) : 0;
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }));
  const close = () => { setView(null); if (view === "done") setDone(null); };

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, table, items: cart.map(l => ({ id: l.id, qty: l.qty, extras: l.extras, note: l.note })) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No pudimos enviar tu pedido. Intenta de nuevo.");
      try { localStorage.setItem("carta-cliente", JSON.stringify({ name: f.name, phone: f.phone, address: f.address })); } catch {}
      setDone(j); setCart([]); setView("done");
      window.location.href = j.waUrl;
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  if (view === "done" && done) return (
    <Sheet onClose={close} label="Pedido enviado">
      <div className={c.sheetBody}>
        <div className={c.legend}>Pedido número {done.id}</div>
        <h2 style={{ fontSize: "2.6rem", margin: "8px 0 12px" }}>Recibimos tu pedido</h2>
        <p className="muted">Quedó registrado por {m(done.total)}. Para confirmarlo, envía el mensaje que se abrió en WhatsApp. Si no se abrió, tócalo aquí:</p>
        <a className="btn btn-solid" style={{ width: "100%", marginTop: 12 }} href={done.waUrl} target="_blank" rel="noopener">Enviar por WhatsApp</a>
        <button type="button" className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={close}>Volver a la carta</button>
      </div>
    </Sheet>
  );

  return (
    <Sheet onClose={close} label="Tu pedido">
      <form className={c.sheetBody} onSubmit={submit}>
        <h2 style={{ fontSize: "2.4rem", marginBottom: 14 }}>Tu pedido</h2>
        {cart.length === 0 && <p className="muted">Aún no has agregado productos.</p>}
        <ul className={c.lines}>
          {cart.map(l => (
            <li key={l.k}>
              <div className={c.lineTxt}><b>{l.name}</b>{l.extras.length > 0 && <span className="hint">+ {l.extras.join(", ")}</span>}{l.note && <span className="hint">“{l.note}”</span>}</div>
              <div className={c.stepper}>
                <button type="button" aria-label={`Quitar uno de ${l.name}`} onClick={() => setQty(l.k, l.qty - 1)}>−</button>
                <span className="num">{l.qty}</span>
                <button type="button" aria-label={`Agregar uno de ${l.name}`} onClick={() => setQty(l.k, l.qty + 1)}>+</button>
              </div>
              <span className={`${c.lineP} num`}>{m(l.unit * l.qty)}</span>
            </li>
          ))}
        </ul>

        {cart.length > 0 && <>
          {types.length > 1 && <div className={c.seg} role="radiogroup" aria-label="Cómo recibir tu pedido">
            {types.map(t => <label key={t} className={f.type === t ? c.segOn : ""}><input type="radio" name="type" value={t} checked={f.type === t} onChange={set("type")} />{t === "recoger" ? "Paso a recoger" : "Domicilio"}</label>)}
          </div>}
          {table && <p className={c.tableNote}>Tu pedido llega a la <b>mesa {table}</b>.</p>}
          <div className={c.form}>
            <div className="field"><label htmlFor="cn">Nombre</label><input id="cn" className="input" required maxLength={60} autoComplete="name" value={f.name} onChange={set("name")} /></div>
            {!table && <div className="field"><label htmlFor="cp">Teléfono</label><input id="cp" className="input" required type="tel" maxLength={20} autoComplete="tel" value={f.phone} onChange={set("phone")} /></div>}
            {f.type === "domicilio" && <div className="field"><label htmlFor="ca">Dirección de entrega</label><input id="ca" className="input" required maxLength={160} autoComplete="street-address" placeholder="Calle, número, apto, barrio" value={f.address} onChange={set("address")} /><span className="hint">{s.orders.deliveryNote}</span></div>}
            <div className="field"><label htmlFor="co">Notas para el pedido (opcional)</label><input id="co" className="input" maxLength={300} value={f.notes} onChange={set("notes")} /></div>
          </div>
          <div className={c.sum}>
            <div><span>Subtotal</span><span className="num">{m(subtotal)}</span></div>
            {fee > 0 && <div><span>Domicilio</span><span className="num">{m(fee)}</span></div>}
            <div className={c.total}><span>Total</span><span className="num">{m(subtotal + fee)}</span></div>
          </div>
          {f.type === "domicilio" && s.orders.minOrder > subtotal && <p className={c.closed}>El pedido mínimo para domicilio es {m(s.orders.minOrder)}.</p>}
          {!canOrder && <p className={c.closed}>{!status.open ? (status.next ? `Abrimos ${status.next.when} a las ${status.next.at}. Tu pedido queda guardado aquí.` : "Estamos cerrados.") : "Los pedidos en línea están pausados."}</p>}
          {err && <p className="err" role="alert">{err}</p>}
          <button type="submit" className="btn btn-solid" style={{ width: "100%", marginTop: 6 }} disabled={busy || !canOrder || (f.type === "domicilio" && s.orders.minOrder > subtotal)}>
            {busy ? "Enviando…" : "Enviar pedido por WhatsApp"}
          </button>
          <p className="hint" style={{ textAlign: "center", marginTop: 8 }}>Guardamos tu pedido y abrimos WhatsApp con el mensaje listo para enviar.</p>
        </>}
      </form>
    </Sheet>
  );
}
