export function money(n, currency = { locale: "es-CO", code: "COP" }) {
  try { return new Intl.NumberFormat(currency.locale, { style: "currency", currency: currency.code, maximumFractionDigits: 0 }).format(n || 0); }
  catch { return "$" + (n || 0); }
}
export const digits = s => String(s || "").replace(/\D/g, "");
export const STATUS = [
  { id: "nuevo", label: "Nuevo" },
  { id: "preparando", label: "Preparando" },
  { id: "listo", label: "Listo" },
  { id: "entregado", label: "Entregado" },
  { id: "cancelado", label: "Cancelado" }
];
export const TYPE_LABEL = { mesa: "Mesa", recoger: "Para recoger", domicilio: "Domicilio" };
