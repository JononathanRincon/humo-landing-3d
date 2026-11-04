import { sql, ready } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/format";
import { openStatus } from "@/lib/hours";
import a from "../admin.module.css";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await ready();
  const s = await getSettings();
  const tz = s.timezone || "America/Bogota";
  const m = n => money(n, s.currency);
  const today = sql`(now() at time zone ${tz})::date`;
  const [k] = await sql`
    select count(*) filter (where (created_at at time zone ${tz})::date = ${today} and status <> 'cancelado')::int as pedidos,
           coalesce(sum(total) filter (where (created_at at time zone ${tz})::date = ${today} and status <> 'cancelado'), 0)::int as ventas,
           count(*) filter (where status in ('nuevo','preparando','listo'))::int as activos,
           coalesce(sum(total) filter (where created_at > now() - interval '30 days' and status <> 'cancelado'), 0)::int as ventas30,
           count(*) filter (where created_at > now() - interval '30 days' and status <> 'cancelado')::int as pedidos30
    from orders`;
  const days = await sql`
    with d as (select generate_series(${today} - 13, ${today}, interval '1 day')::date as day)
    select to_char(d.day, 'DD/MM') as label, extract(dow from d.day)::int as dow,
           coalesce(sum(o.total), 0)::int as total, count(o.id)::int as n
    from d left join orders o on (o.created_at at time zone ${tz})::date = d.day and o.status <> 'cancelado'
    group by d.day order by d.day`;
  const top = await sql`
    select it->>'name' as name, sum((it->>'qty')::int)::int as qty, sum((it->>'total')::int)::int as total
    from orders o, jsonb_array_elements(o.items) it
    where o.created_at > now() - interval '30 days' and o.status <> 'cancelado'
    group by 1 order by 2 desc limit 6`;
  const views = await sql`
    select p.name, sum(v.views)::int as views from product_views v join products p on p.id = v.product_id
    where v.day > ${today} - 30 group by p.name order by 2 desc limit 6`;
  const byType = await sql`select type, count(*)::int as n from orders where created_at > now() - interval '30 days' and status <> 'cancelado' group by type`;
  const [pv] = await sql`select coalesce(sum(views),0)::int as n from page_views where day > ${today} - 30`;
  const st = openStatus(s);
  const avg = k.pedidos30 ? Math.round(k.ventas30 / k.pedidos30) : 0;
  const maxD = Math.max(1, ...days.map(d => d.total));
  const maxT = Math.max(1, ...top.map(t => t.qty));
  const maxV = Math.max(1, ...views.map(t => t.views));
  const W = 700, H = 200, bw = W / days.length;
  const conv = pv.n ? Math.round((k.pedidos30 / pv.n) * 1000) / 10 : 0;
  const TL = { mesa: "En mesa", recoger: "Para recoger", domicilio: "Domicilio" };

  return (
    <>
      <div className={a.pageH}>
        <div><div className="eyebrow">Resumen</div><h1>Hoy en {s.name}</h1></div>
        <span className={`pill ${st.open ? "ok" : "bad"}`}>{st.open ? `Abierto hasta ${st.closesAt}` : st.next ? `Cerrado · abre ${st.next.when} ${st.next.at}` : "Cerrado"}</span>
      </div>
      <div className={a.kpis}>
        <div className={`${a.card} ${a.kpi}`}><span>Ventas de hoy</span><b>{m(k.ventas)}</b></div>
        <div className={`${a.card} ${a.kpi}`}><span>Pedidos de hoy</span><b>{k.pedidos}</b></div>
        <a href="/admin/pedidos" className={`${a.card} ${a.kpi}`} style={{ textDecoration: "none", borderColor: k.activos ? "var(--accent)" : undefined }}><span>En curso ahora</span><b>{k.activos}</b></a>
        <div className={`${a.card} ${a.kpi}`}><span>Ticket promedio · 30 días</span><b>{m(avg)}</b></div>
      </div>
      <div className={a.card} style={{ marginBottom: 16 }}>
        <h2>Ventas · últimos 14 días</h2>
        <div style={{ overflowX: "auto" }}>
          <svg className={a.chart} viewBox={`0 0 ${W} ${H + 34}`} role="img" aria-label="Ventas por día">
            {[0, .5, 1].map(f => <line key={f} x1="0" x2={W} y1={H - f * (H - 16)} y2={H - f * (H - 16)} stroke="var(--line)" />)}
            {days.map((d, i) => {
              const h = (d.total / maxD) * (H - 16);
              return <g key={i}>
                <rect x={i * bw + bw * .18} y={H - h} width={bw * .64} height={Math.max(h, d.total ? 2 : 0)} rx="4" fill={i === days.length - 1 ? "var(--accent)" : "color-mix(in srgb, var(--accent) 45%, var(--bg-3))"} />
                {d.total > 0 && d.total === maxD && <text x={Math.min(i * bw + bw / 2, W - 4)} y={H - h - 6} textAnchor={i >= days.length - 2 ? "end" : "middle"} fill="var(--ink)" fontSize="11" fontFamily="var(--f-mono)">{m(d.total)}</text>}
                <text x={i * bw + bw / 2} y={H + 18} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--f-mono)">{d.label}</text>
                <text x={i * bw + bw / 2} y={H + 31} textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="var(--f-mono)">{d.n ? `${d.n} ped.` : ""}</text>
              </g>;
            })}
          </svg>
        </div>
      </div>
      <div className={a.grid2}>
        <div className={a.card}>
          <h2>Más pedidos · 30 días</h2>
          {top.length ? <ol className={a.rank}>{top.map((t, i) => <li key={t.name}><i>{i + 1}</i><span>{t.name}</span><span className="num">{t.qty} uds</span><div className={a.bar}><span style={{ width: `${(t.qty / maxT) * 100}%` }} /></div></li>)}</ol>
            : <p className={a.empty}>Cuando lleguen pedidos verás aquí los productos que más se venden.</p>}
        </div>
        <div className={a.card}>
          <h2>Más vistos en la carta · 30 días</h2>
          {views.length ? <ol className={a.rank}>{views.map((t, i) => <li key={t.name}><i>{i + 1}</i><span>{t.name}</span><span className="num">{t.views}</span><div className={a.bar}><span style={{ width: `${(t.views / maxV) * 100}%` }} /></div></li>)}</ol>
            : <p className={a.empty}>Aquí aparecen los productos que los clientes abren en la carta digital.</p>}
        </div>
        <div className={a.card}>
          <h2>Cómo piden · 30 días</h2>
          {byType.length ? <ul className={a.rank}>{byType.map(t => <li key={t.type}><i /><span>{TL[t.type] || t.type}</span><span className="num">{t.n}</span></li>)}</ul>
            : <p className={a.empty}>Sin pedidos todavía.</p>}
        </div>
        <div className={a.card}>
          <h2>Visitas a la carta · 30 días</h2>
          <ul className={a.rank}>
            <li><i /><span>Visitas</span><span className="num">{pv.n}</span></li>
            <li><i /><span>Pedidos</span><span className="num">{k.pedidos30}</span></li>
            <li><i /><span>Visitas que terminan en pedido</span><span className="num">{conv}%</span></li>
          </ul>
        </div>
      </div>
    </>
  );
}
