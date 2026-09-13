"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signSession } from "./auth";
import { SESSION_MAX_AGE_MS, sessionCookieOptions } from "./session";

/**
 * Нууц үгийг тогтмол хугацаанд харьцуулна.
 *
 * Энгийн `===` нь эхний зөрүүтэй байт дээр зогсдог тул хариу ирэх хугацаагаар
 * «хэдэн тэмдэгт таарсныг» алдагдуулна. auth.ts дахь гарын үсгийн харьцуулалт
 * timingSafeEqual ашигладаг тул нууц үг нь түүнээс сул байх учиргүй.
 *
 * Уртын зөрүүг эхэлж шалгана — timingSafeEqual нь өөр урттай буферт алдаа
 * шиднэ. Урт задрах нь эрсдэлгүй: brute force-ыг мэдэгдэхүйц хөнгөвчлөхгүй.
 */
function passwordMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return "Сервер тохируулагдаагүй байна";

  const provided = formData.get("password");
  if (typeof provided !== "string" || !passwordMatches(provided, password)) {
    return "Нууц үг буруу байна";
  }

  const token = signSession(secret, Date.now() + SESSION_MAX_AGE_MS);
  (await cookies()).set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(SESSION_MAX_AGE_MS),
  );

  redirect("/admin");
}

/** Гарах — cookie-г устгаад нэвтрэх хуудас руу буцаана. */
export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/newterh");
}
