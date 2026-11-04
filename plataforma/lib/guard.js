import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifySession } from "./auth";

export async function requireAdmin() {
  const s = await verifySession(cookies().get(COOKIE)?.value);
  return s;
}
export const unauthorized = () => NextResponse.json({ error: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 });
export const bad = msg => NextResponse.json({ error: msg }, { status: 400 });
