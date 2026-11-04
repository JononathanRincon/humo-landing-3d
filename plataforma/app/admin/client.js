"use client";
export async function api(path, opts = {}) {
  const r = await fetch(path, { ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) }, body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = "/admin/login"; throw new Error(j.error || "Sesión expirada"); }
  if (!r.ok) throw new Error(j.error || "Algo salió mal. Intenta de nuevo.");
  return j;
}

// Reduce fotos en el teléfono antes de subirlas: carga más rápido y ocupa menos.
async function shrink(file, max = 1600) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise(res => cv.toBlob(res, "image/webp", .84));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch { return file; }
}

let modeP = null;
export async function uploadFile(file, { onProgress, folder = "media", max } = {}) {
  const f = await shrink(file, max);
  modeP ||= fetch("/api/admin/blob").then(r => r.json()).then(j => j.mode);
  const mode = await modeP;
  if (mode === "local") {
    const fd = new FormData(); fd.append("file", f);
    const r = await fetch("/api/admin/upload-local", { method: "POST", body: fd }); const j = await r.json();
    if (!r.ok) throw new Error(j.error); onProgress?.(100); return j.url;
  }
  if (mode !== "blob") throw new Error("El almacenamiento de archivos no está configurado.");
  const { upload } = await import("@vercel/blob/client");
  const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const res = await upload(`${folder}/${safe}`, f, { access: "public", handleUploadUrl: "/api/admin/blob", multipart: f.size > 8 * 1024 * 1024,
    onUploadProgress: e => onProgress?.(Math.round(e.percentage)) });
  return res.url;
}
