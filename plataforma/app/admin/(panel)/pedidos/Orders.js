"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../client";
import { money, STATUS, TYPE_LABEL, digits } from "@/lib/format";
import a from "../../admin.module.css";

const NEXT = { nuevo: "preparando", preparando: "listo", listo: "entregado" };
const NEXT_LABEL = { nuevo: "Empezar a preparar", preparando: "Marcar listo", listo: "Marcar entregado" };
const PILL = { nuevo: "accent", preparando: "warn", listo: "ok", entregado: "", cancelado: "bad" };
const FILTERS = [["activos", "En curso"], ["nuevo", "Nuevos"], ["preparando", "Preparando"], ["listo", "Listos"], ["entregado", "Entregados"], ["cancelado", "Cancelados"], ["todos", "Todos"]];

function ago(d) {
  const min = Math.round((Date.now() - new Date(d)) / 60000);
  if (min < 1) return "hace un momento"; if (min < 60) return `hace ${min} min`;
  return new Date(d).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Orders({ currency }) {
  const m = n => money(n, currency);
  const [filter, setFilter] = useState("activos");
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    try { const j = await api(`/api/admin/orders?status=${filter}`); setOrders(j.orders); setErr(""); } catch (e) { setErr(e.message); }
  }, [filter]);
  useEffect(() => { setOrders(null); load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);
  async function setStatus(o, status) {
    setOrders(list => list.map(x => x.id === o.id ? { ...x, status } : x));
    try { await api(`/api/admin/orders/${o.id}`, { method: "PATCH", body: { status } }); load(); } catch (e) { setErr(e.message); load(); }
  }
  return (
    <>
      <div className={a.pageH}>
        <div><div className="eyebrow">Operación</div><h1>Pedidos</h1></div>
        <span className="hint">Se actualiza solo cada 15 segundos</span>
      </div>
      <div className={a.tabs} role="tablist">
        {FILTERS.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={filter === id} className={`${a.tab} ${filter === id ? a.tabOn : ""}`} onClick={() => setFilter(id)}>{l}</button>)}
      </div>
      {err && <p className="err">{err}</p>}
      {orders === null ? <p className="muted">Cargando pedidos…</p> : orders.length === 0 ? (
        <div className={a.card}><p className={a.empty}>{filter === "activos" ? "No hay pedidos en curso. Los nuevos aparecen aquí automáticamente." : "No hay pedidos en este estado."}</p></div>
      ) : (
        <div className={a.orders}>
          {orders.map(o => (
            <article key={o.id} className={`${a.order} ${o.status === "nuevo" ? a.isNew : ""}`}>
              <div className={a.oHead}>
                <div><b>#{o.id}</b><div className={a.oMeta}>{o.type === "mesa" ? `Mesa ${o.table_no}` : TYPE_LABEL[o.type]} · {ago(o.created_at)}</div></div>
                <span className={`pill ${PILL[o.status]}`}>{STATUS.find(s => s.id === o.status)?.label}</span>
              </div>
              <div className={a.oMeta}>
                <b style={{ color: "var(--ink)" }}>{o.customer_name}</b>
                {o.customer_phone && <> · <a href={`https://wa.me/${digits(o.customer_phone)}`} target="_blank" rel="noopener">{o.customer_phone}</a></>}
                {o.address && <div>{o.address}</div>}
              </div>
              <ul className={a.oItems}>
                {o.items.map((it, i) => <li key={i}><b className="num">{it.qty} ×</b> {it.name}
                  {it.extras?.length > 0 && <small>+ {it.extras.map(e => e.name).join(", ")}</small>}
                  {it.note && <small>Nota: {it.note}</small>}</li>)}
              </ul>
              {o.notes && <div className={a.oMeta}>Notas: {o.notes}</div>}
              <div className={a.oFoot}>
                <span className={a.oTotal}>{m(o.total)}{o.delivery_fee > 0 && <span className="hint"> (incl. domicilio)</span>}</span>
                <div className={a.actions}>
                  {NEXT[o.status] && <button type="button" className="btn btn-solid btn-sm" onClick={() => setStatus(o, NEXT[o.status])}>{NEXT_LABEL[o.status]}</button>}
                  {["nuevo", "preparando"].includes(o.status) && <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => setStatus(o, "cancelado")}>Cancelar</button>}
                  {o.status === "cancelado" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus(o, "nuevo")}>Reabrir</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
