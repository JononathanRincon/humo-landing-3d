import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "humo_admin";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "solo-para-desarrollo-cambiar");

export async function signSession(admin) {
  return new SignJWT({ sub: String(admin.id), email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function verifySession(token) {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return payload; } catch { return null; }
}

export const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 };
