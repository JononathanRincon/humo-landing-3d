import { NextResponse } from "next/server";
import { COOKIE, verifySession } from "./lib/auth";

const OPEN = ["/admin/login", "/admin/setup", "/api/admin/blob"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (OPEN.some(p => pathname.startsWith(p))) return NextResponse.next();
  const ok = await verifySession(req.cookies.get(COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/admin/login"; url.search = "";
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
