import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ready } from "@/lib/db";
import { signSession, COOKIE, cookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  await ready();
  const [{ n }] = await sql`select count(*)::int as n from admins`;
  if (n > 0) return NextResponse.json({ error: "El panel ya tiene un administrador. Inicia sesión." }, { status: 409 });
  const { email, password } = await req.json().catch(() => ({}));
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  if (String(password || "").length < 8) return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const [admin] = await sql`insert into admins (email, password_hash) values (${e}, ${hash}) returning id, email`;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(admin), cookieOptions);
  return res;
}

export async function GET() {
  await ready();
  const [{ n }] = await sql`select count(*)::int as n from admins`;
  return NextResponse.json({ needsSetup: n === 0 });
}
