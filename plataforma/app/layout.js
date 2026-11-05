import "./globals.css";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings().catch(() => null);
  return {
    title: s ? `${s.name} · ${s.tagline}` : "Carta digital",
    description: s ? `${s.tagline} en ${s.city}. Mira la carta y pide por WhatsApp.` : ""
  };
}

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#201c1b" };

export default async function RootLayout({ children }) {
  const s = await getSettings().catch(() => null);
  const accent = s?.accent && /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : "#d4a356";
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" />
        <style>{`:root{--accent:${accent}}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
