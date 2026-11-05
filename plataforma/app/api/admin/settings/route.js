import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { return NextResponse.json({ settings: await getSettings() }); }

export async function PUT(req) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "No hay cambios." }, { status: 400 });
  if (b.name !== undefined && !String(b.name).trim()) return NextResponse.json({ error: "El negocio necesita un nombre." }, { status: 400 });
  if (b.accent && !/^#[0-9a-f]{6}$/i.test(b.accent)) return NextResponse.json({ error: "El color debe tener formato #RRGGBB." }, { status: 400 });
  if (b.videoSpeed !== undefined) b.videoSpeed = Math.min(3, Math.max(.5, Number(b.videoSpeed) || 1.75));
  if (b.tables !== undefined) b.tables = Math.max(0, Math.min(200, parseInt(b.tables, 10) || 0));
  return NextResponse.json({ settings: await saveSettings(b) });
}
