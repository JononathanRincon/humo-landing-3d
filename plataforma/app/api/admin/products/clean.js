const clip = (s, n) => String(s ?? "").trim().slice(0, n);
export function cleanProduct(b, partial = false) {
  const out = {};
  if (!partial || "name" in b) { out.name = clip(b.name, 80); if (!out.name) return { error: "El producto necesita un nombre." }; }
  if (!partial || "description" in b) out.description = clip(b.description, 400);
  if (!partial || "price" in b) { out.price = Math.round(Number(b.price)); if (!(out.price >= 0)) return { error: "Escribe un precio válido." }; }
  if (!partial || "category_id" in b) out.category_id = parseInt(b.category_id, 10) || null;
  if (!partial || "image_url" in b) out.image_url = clip(b.image_url, 600) || null;
  if (!partial || "extras" in b) out.extras = (Array.isArray(b.extras) ? b.extras : []).map(e => ({ name: clip(e.name, 60), price: Math.max(0, Math.round(Number(e.price) || 0)) })).filter(e => e.name).slice(0, 20);
  if (!partial || "layers" in b) out.layers = (Array.isArray(b.layers) ? b.layers : []).map(e => ({ name: clip(e.name, 60), grams: Math.max(0, Math.round(Number(e.grams) || 0)) })).filter(e => e.name).slice(0, 20);
  for (const k of ["available", "active", "featured"]) if (!partial || k in b) out[k] = k in b ? !!b[k] : k !== "featured";
  if ("position" in b) out.position = parseInt(b.position, 10) || 0;
  return out;
}
