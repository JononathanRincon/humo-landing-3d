import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Permite "Agregar a la pantalla de inicio" con el nombre y el ícono del negocio.
export default async function manifest() {
  const s = await getSettings().catch(() => null);
  const name = s?.name || "Carta digital";
  return {
    name: s?.tagline ? `${name} · ${s.tagline}` : name,
    short_name: name,
    start_url: "/",
    display: "standalone",
    background_color: "#201c1b",
    theme_color: "#201c1b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
