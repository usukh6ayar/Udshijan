import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "udshijan_admin";

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** `exp.signature` хэлбэртэй токен. Нууц үг өөрөө хэзээ ч энд орохгүй. */
export function signSession(secret: string, expiresAt: number): string {
  const payload = String(expiresAt);
  return `${payload}.${sign(secret, payload)}`;
}

export function verifySession(secret: string, token: string): boolean {
  if (typeof token !== "string") return false;

  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const provided = token.slice(dot + 1);

  const expected = sign(secret, payload);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
