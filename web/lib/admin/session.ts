import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_MS = 7 * DAY;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET тохируулаагүй байна");
  return value;
}

/**
 * Нэвтэрсэн эсэхийг шалгана.
 *
 * Cache Components асаалттай тул энэ функцийг `use cache` scope дотор эсвэл
 * layout-ийн дээд талд дуудаж БОЛОХГҮЙ — cookies() унших нь тэнд алдаа өгнө.
 * Server Action дотор болон Suspense хилийн доторх компонентод дуудна.
 */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(secret(), token) : false;
}

/** Server Action бүрийн эхэнд дуудна. Энэ бол жинхэнэ хамгаалалтын хил. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Нэвтрэх шаардлагатай");
}

export function sessionCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}
