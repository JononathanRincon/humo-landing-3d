import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { COOKIE, verifySession } from "@/lib/auth";
export const runtime = "nodejs";

// Subida directa del navegador a Vercel Blob (sirve para fotos y videos grandes).
export async function POST(req) {
  const body = await req.json();
  try {
    const json = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async () => {
        const s = await verifySession(cookies().get(COOKIE)?.value);
        if (!s) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true
        };
      },
      onUploadCompleted: async () => {}
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e.message || "No se pudo subir el archivo." }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ mode: process.env.BLOB_READ_WRITE_TOKEN ? "blob" : (process.env.NODE_ENV === "production" ? "none" : "local") });
}
