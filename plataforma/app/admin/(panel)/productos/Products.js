"use client";
import { useEffect, useState } from "react";
import { api, uploadFile } from "../../client";
import { money } from "@/lib/format";
import a from "../../admin.module.css";

const EMPTY = { name: "", description: "", price: "", category_id: "", image_url: "", extras: [], layers: [], available: true, active: true, featured: false };

export default function Products({ currency }) {
  const m = n => money(n, currency);
  const [data, setData] = useState(null);
  const [edit, setEdit] = useState(null);
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");
  const say = t => { setToast(t); setTimeout(() => setToast(""), 2200); };
  const load = () => api("/api/admin/products").then(setData).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  async function patch(p, body, msg) {
    setData(d => ({ ...d, products: d.products.map(x => x.id === p.id ? { ...x, ...body } : x) }));
    try { await api(`/api/admin/products/${p.id}`, { method: "PATCH", body }); if (msg) say(msg); } catch (e) { setErr(e.message); load(); }
  }
  async function catAction(cat, body) { try { await api(`/api/admin/categories/${cat.id}`, { method: "PATCH", body }); load(); } catch (e) { setErr(e.message); } }
  async function catDelete(cat) { try { await api(`/api/admin/categories/${cat.id}`, { method: "DELETE" }); load(); say("Categoría eliminada"); } catch (e) { setErr(e.message); } }
  async function addCat(e) {
    e.preventDefault(); const name = new FormData(e.target).get("cat");
    try { await api("/api/admin/categories", { method: "POST", body: { name } }); e.target.reset(); load(); say("Categoría creada"); } catch (x) { setErr(x.message); }
  }
  async function move(p, dir) {
    const list = data.products.filter(x => x.category_id === p.category_id);
    const i = list.findIndex(x => x.id === p.id), j = i + dir; if (j < 0 || j >= list.length) return;
    const A = list[i], B = list[j];
    const pa = A.position === B.position ? A.position + dir : B.position, pb = A.position;
    await Promise.all([api(`/api/admin/products/${A.id}`, { method: "PATCH", body: { position: pa } }), api(`/api/admin/products/${B.id}`, { method: "PATCH", body: { position: pb } })]).catch(e => setErr(e.message));
    load();
  }

  if (!data) return <p className="muted">{err || "Cargando la carta…"}</p>;
  const groups = [...data.categories.map(c => ({ ...c, items: data.products.filter(p => p.category_id === c.id) })),
    { id: null, name: "Sin categoría", items: data.products.filter(p => !p.category_id || !data.categories.some(c => c.id === p.category_id)) }].filter(g => g.id !== null || g.items.length);

  return (
    <>
      <div className={a.pageH}>
        <div><div className="eyebrow">Carta</div><h1>Productos y precios</h1></div>
        <button type="button" className="btn btn-solid" onClick={() => setEdit({ ...EMPTY, category_id: data.categories[0]?.id || "" })}>Nuevo producto</button>
      </div>
      {err && <p className="err" role="alert">{err} <button className="btn btn-ghost btn-sm" onClick={() => setErr("")}>Entendido</button></p>}
      {groups.map((g, gi) => (
        <section key={g.id ?? "none"}>
          <div className={a.catHead}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h2>{g.name}</h2>
              {g.id && !g.active && <span className="pill bad">Oculta en la carta</span>}
              <span className="hint">{g.items.length} producto(s)</span>
            </div>
            {g.id && <div className={a.actions}>
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Subir categoría" disabled={gi === 0} onClick={() => catAction(g, { move: -1 })}>↑</button>
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Bajar categoría" disabled={gi >= data.categories.length - 1} onClick={() => catAction(g, { move: 1 })}>↓</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { const n = window.prompt?.("Nuevo nombre de la categoría", g.name); if (n) catAction(g, { name: n }); }}>Renombrar</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => catAction(g, { active: !g.active })}>{g.active ? "Ocultar" : "Mostrar"}</button>
              {g.items.length === 0 && <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => catDelete(g)}>Eliminar</button>}
            </div>}
          </div>
          <div className={a.prodList}>
            {g.items.map((p, i) => (
              <div key={p.id} className={a.prod} style={{ opacity: p.active ? 1 : .5 }}>
                <div className={a.prodImg}>{p.image_url ? <img src={p.image_url} alt="" /> : <div className="ph" style={{ height: "100%", fontSize: "1.4rem" }}>{p.name[0]}</div>}</div>
                <button type="button" className={a.prodTxt} style={{ background: "none", border: 0, textAlign: "left", cursor: "pointer", padding: 0 }} onClick={() => setEdit({ ...p, price: String(p.price) })}>
                  <b>{p.name} {p.featured && <span className="pill accent" style={{ marginLeft: 6 }}>Destacado</span>} {!p.active && <span className="pill">Oculto</span>}</b>
                  <span className="num">{m(p.price)}{p.extras?.length ? ` · ${p.extras.length} adiciones` : ""}</span>
                </button>
                <div className={a.prodR}>
                  <label className={a.availLbl}>
                    <span className="toggle"><input type="checkbox" checked={p.available} onChange={e => patch(p, { available: e.target.checked }, e.target.checked ? `${p.name} disponible` : `${p.name} marcado como agotado`)} aria-label={`${p.name} disponible`} /><span /></span>
                    {p.available ? "Disponible" : "Agotado"}
                  </label>
                  <div className={a.actions}>
                    <button type="button" className="btn btn-ghost btn-sm" aria-label="Subir" disabled={i === 0} onClick={() => move(p, -1)}>↑</button>
                    <button type="button" className="btn btn-ghost btn-sm" aria-label="Bajar" disabled={i === g.items.length - 1} onClick={() => move(p, 1)}>↓</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit({ ...p, price: String(p.price) })}>Editar</button>
                  </div>
                </div>
              </div>
            ))}
            {g.items.length === 0 && <p className={a.empty}>Sin productos. Crea uno con “Nuevo producto”.</p>}
          </div>
        </section>
      ))}
      <form onSubmit={addCat} className={a.card} style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ flex: "1 1 220px" }}><label htmlFor="newcat">Nueva categoría</label><input id="newcat" name="cat" className="input" placeholder="Ej.: Postres" required maxLength={40} /></div>
        <button className="btn btn-ghost">Agregar categoría</button>
      </form>
      {edit && <Editor p={edit} categories={data.categories} m={m} onClose={() => setEdit(null)} onSaved={msg => { setEdit(null); load(); say(msg); }} />}
      {toast && <div className={a.toast} role="status">{toast}</div>}
    </>
  );
}

function Editor({ p, categories, m, onClose, onSaved }) {
  const [f, setF] = useState(p);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [pct, setPct] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const list = (k, i, key, v) => set(k, f[k].map((r, j) => j === i ? { ...r, [key]: v } : r));
  useEffect(() => { const k = e => e.key === "Escape" && onClose(); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);

  async function pick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setErr(""); setPct(0);
    try { const url = await uploadFile(file, { folder: "productos", onProgress: setPct }); set("image_url", url); } catch (x) { setErr(x.message); } finally { setPct(null); e.target.value = ""; }
  }
  async function save(e) {
    e.preventDefault(); setBusy(true); setErr("");
    const body = { ...f, price: Number(String(f.price).replace(/\D/g, "")) || 0 };
    try {
      if (p.id) await api(`/api/admin/products/${p.id}`, { method: "PATCH", body }); else await api("/api/admin/products", { method: "POST", body });
      onSaved(p.id ? "Cambios guardados" : "Producto creado");
    } catch (x) { setErr(x.message); setBusy(false); }
  }
  async function del() {
    try { await api(`/api/admin/products/${p.id}`, { method: "DELETE" }); onSaved("Producto eliminado"); } catch (x) { setErr(x.message); }
  }
  return (
    <div className={a.modalBg} onClick={onClose}>
      <form className={a.modal} onClick={e => e.stopPropagation()} onSubmit={save} role="dialog" aria-modal="true" aria-label={p.id ? "Editar producto" : "Nuevo producto"}>
        <div className={a.modalH}><h2>{p.id ? "Editar producto" : "Nuevo producto"}</h2><button type="button" className={a.x} onClick={onClose} aria-label="Cerrar">×</button></div>

        <div className={a.imgPick}>
          <div className={a.imgPrev}>{f.image_url ? <img src={f.image_url} alt="" /> : <div className="ph" style={{ height: "100%", fontSize: "1rem" }}>Sin foto</div>}</div>
          <div className="field">
            <span className="lbl">Foto</span>
            <label className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
              {pct !== null ? `Subiendo ${pct}%` : f.image_url ? "Cambiar foto" : "Subir foto"}
              <input type="file" accept="image/*" hidden onChange={pick} />
            </label>
            <span className="hint">Desde la galería o la cámara. La ajustamos de tamaño automáticamente.</span>
            {f.image_url && <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set("image_url", "")}>Quitar foto</button>}
          </div>
        </div>

        <div className="field"><label htmlFor="pn">Nombre</label><input id="pn" className="input" required maxLength={80} value={f.name} onChange={e => set("name", e.target.value)} /></div>
        <div className="field"><label htmlFor="pd">Descripción</label><textarea id="pd" className="input" maxLength={400} value={f.description} onChange={e => set("description", e.target.value)} /></div>
        <div className={a.row2}>
          <div className="field"><label htmlFor="pp">Precio</label><input id="pp" className="input num" inputMode="numeric" required value={f.price} onChange={e => set("price", e.target.value.replace(/[^\d]/g, ""))} /><span className="hint">{m(Number(f.price) || 0)}</span></div>
          <div className="field"><label htmlFor="pc">Categoría</label>
            <select id="pc" className="input" value={f.category_id || ""} onChange={e => set("category_id", e.target.value)}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
        </div>

        <div className="field">
          <span className="lbl">Adiciones con precio</span>
          <div className={a.rows}>
            {f.extras.map((r, i) => <div key={i} className={a.rowItem}>
              <input className="input" aria-label="Nombre de la adición" placeholder="Ej.: Tocineta extra" value={r.name} onChange={e => list("extras", i, "name", e.target.value)} />
              <input className="input num" aria-label="Precio de la adición" inputMode="numeric" placeholder="Precio" value={r.price} onChange={e => list("extras", i, "price", e.target.value.replace(/\D/g, ""))} />
              <button type="button" className={a.x} aria-label="Quitar adición" onClick={() => set("extras", f.extras.filter((_, j) => j !== i))}>×</button>
            </div>)}
            <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set("extras", [...f.extras, { name: "", price: "" }])}>Agregar adición</button>
          </div>
        </div>

        <div className="field">
          <span className="lbl">Ingredientes para la escena “Anatomía” (opcional)</span>
          <span className="hint">De arriba hacia abajo, con gramos. Se muestran en la web sobre la foto despiezada.</span>
          <div className={a.rows}>
            {f.layers.map((r, i) => <div key={i} className={a.rowItem}>
              <input className="input" aria-label="Ingrediente" value={r.name} onChange={e => list("layers", i, "name", e.target.value)} />
              <input className="input num" aria-label="Gramos" inputMode="numeric" placeholder="g" value={r.grams} onChange={e => list("layers", i, "grams", e.target.value.replace(/\D/g, ""))} />
              <button type="button" className={a.x} aria-label="Quitar ingrediente" onClick={() => set("layers", f.layers.filter((_, j) => j !== i))}>×</button>
            </div>)}
            <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set("layers", [...f.layers, { name: "", grams: "" }])}>Agregar ingrediente</button>
          </div>
        </div>

        <div className={a.checks}>
          {[["available", "Disponible hoy", "Apágalo cuando se agote. El cliente lo ve como “Agotado”."], ["active", "Visible en la carta", "Ocúltalo sin borrarlo, por ejemplo si es de temporada."], ["featured", "Destacado", "Aparece en la portada de la web y con la etiqueta “De la casa”."]].map(([k, l, h]) => (
            <label key={k} className={a.checkRow}><span>{l}<small>{h}</small></span><span className="toggle"><input type="checkbox" checked={!!f[k]} onChange={e => set(k, e.target.checked)} /><span /></span></label>
          ))}
        </div>

        {err && <p className="err" role="alert">{err}</p>}
        <div className={a.saveBar}>
          {p.id && (confirmDel
            ? <><span className="hint" style={{ marginRight: "auto", alignSelf: "center" }}>¿Eliminar definitivamente?</span><button type="button" className="btn btn-ghost btn-danger" onClick={del}>Sí, eliminar</button><button type="button" className="btn btn-ghost" onClick={() => setConfirmDel(false)}>No</button></>
            : <button type="button" className="btn btn-ghost btn-danger" style={{ marginRight: "auto" }} onClick={() => setConfirmDel(true)}>Eliminar</button>)}
          {!confirmDel && <><button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-solid" disabled={busy || pct !== null}>{busy ? "Guardando…" : "Guardar"}</button></>}
        </div>
      </form>
    </div>
  );
}
