import { randomBytes, timingSafeEqual } from "node:crypto";
import { phoneDigits } from "./validate";

/**
 * Захиалгын хуудас нэр, утас, хаяг харуулдаг тул дугаар мэдэх нь хангалтгүй.
 * Захиалагчийн браузерт тухайн захиалгын түлхүүр бүхий httpOnly cookie
 * тавина; өөр төхөөрөмжөөс утасны дугаараар баталгаажуулж cookie авна.
 */
const COOKIE_PREFIX = "udshijan_order_";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export function orderCookieName(number: string): string {
  return COOKIE_PREFIX + number;
}

export function newAccessKey(): string {
  return randomBytes(32).toString("base64url");
}

export function keyMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function phoneMatches(provided: string, stored: string): boolean {
  const digits = phoneDigits(provided);
  return digits.length === 8 && digits === phoneDigits(stored);
}

export function orderCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
