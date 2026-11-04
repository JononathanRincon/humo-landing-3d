import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, ready } from "@/lib/db";
import { signSession, COOKIE, cookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  await ready();
  const { email, password } = await req.json().catch(() => ({}));
  const [admin] = await sql`select id, email, password_hash from admins where email = ${String(email || "").trim().toLowerCase()}`;
  const ok = admin && await bcrypt.compare(String(password || ""), admin.password_hash);
  if (!ok) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signSession(admin), cookieOptions);
  return res;
}
