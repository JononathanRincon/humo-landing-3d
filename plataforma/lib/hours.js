// Calcula si el local está abierto según el horario y la zona horaria configurados.
const toMin = s => { const [h, m] = String(s || "0:0").split(":").map(Number); return h * 60 + (m || 0); };

function localNow(tz, date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(date).map(p => [p.type, p.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { day, min: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
}

export function openStatus(settings, date = new Date()) {
  const hours = settings.hours || [];
  const { day, min } = localNow(settings.timezone || "America/Bogota", date);
  const byDay = d => hours.find(h => h.day === d);
  const isIn = (h, m, prevDay) => {
    if (!h || h.closed) return false;
    const o = toMin(h.open), c = toMin(h.close) || 1440;
    if (c > o) return !prevDay && m >= o && m < c;
    // cierra después de medianoche
    return prevDay ? m < c : m >= o;
  };
  const today = byDay(day), yesterday = byDay((day + 6) % 7);
  const open = isIn(today, min, false) || isIn(yesterday, min, true);
  let next = null;
  if (!open) {
    for (let i = 0; i < 7; i++) {
      const h = byDay((day + i) % 7);
      if (h && !h.closed && (i > 0 || toMin(h.open) > min)) { next = { when: i === 0 ? "hoy" : i === 1 ? "mañana" : h.label?.toLowerCase(), at: h.open }; break; }
    }
  }
  const closesAt = open ? (isIn(today, min, false) ? today.close : yesterday.close) : null;
  return { open, next, closesAt };
}
