import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mm_portal";
const MAX_AGE = 60 * 60 * 24 * 30;

export type SessionRole = "client" | "admin" | "planner";

export type PortalSession = {
  sub: string;
  role: SessionRole;
  email: string;
  name: string;
  clientId?: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Falta AUTH_SECRET");
    }
    return new TextEncoder().encode("manymakeups-dev-secret-not-for-prod");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: PortalSession) {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    name: payload.name,
    ...(payload.clientId ? { cid: payload.clientId } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function readSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "client" && payload.role !== "admin" && payload.role !== "planner") ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role === "planner" && typeof payload.cid !== "string")
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
      clientId: payload.role === "planner" ? String(payload.cid) : undefined,
    } satisfies PortalSession;
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSessionCookie(session: PortalSession) {
  const token = await signSession(session);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function requireClient() {
  const session = await getSession();
  if (!session || session.role !== "client") return null;
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function requirePlanner() {
  const session = await getSession();
  if (!session || session.role !== "planner" || !session.clientId) return null;
  return { ...session, clientId: session.clientId };
}
