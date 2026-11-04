import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
export const runtime = "nodejs";

// Solo para desarrollo local, cuando no hay Vercel Blob configurado.
export async function POST(req) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Configura Vercel Blob para subir archivos." }, { status: 400 });
  const form = await req.formData();
  const f = form.get("file");
  if (!f) return NextResponse.json({ error: "No llegó ningún archivo." }, { status: 400 });
  const ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
