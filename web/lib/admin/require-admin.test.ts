import { beforeEach, describe, expect, it, vi } from "vitest";
import { signSession } from "./auth";

/**
 * Server Action бүр `requireAdmin()`-аар эхэлдэг нь ЖИНХЭНЭ хамгаалалтын хил.
 * proxy.ts нь зөвхөн cookie байгаа эсэхийг хардаг тул хуурамч cookie түүнийг
 * давж гардаг — доорх тестүүд тэр үед ч mutation зогсож байгааг батална.
 */

const SECRET = "test-secret-hangalttai-urt-utga-2026";
let cookieValue: string | undefined;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "udshijan_admin" && cookieValue !== undefined
        ? { value: cookieValue }
        : undefined,
  }),
}));

const { requireAdmin, isAdmin } = await import("./session");

beforeEach(() => {
  vi.stubEnv("ADMIN_SESSION_SECRET", SECRET);
  cookieValue = undefined;
});

describe("requireAdmin", () => {
  it("cookie огт байхгүй үед татгалзана", async () => {
    await expect(requireAdmin()).rejects.toThrow("Нэвтрэх шаардлагатай");
  });

  it("хуурамч гарын үсэгтэй cookie-г татгалзана", async () => {
    // proxy.ts энэ cookie-г нэвтрүүлнэ — энд зогсох ёстой
    cookieValue = `${Date.now() + 60_000}.hуурамч-гарын-үсэг`;
    await expect(requireAdmin()).rejects.toThrow("Нэвтрэх шаардлагатай");
  });

  it("өөр түлхүүрээр зурсан cookie-г татгалзана", async () => {
    cookieValue = signSession("өөр-түлхүүр", Date.now() + 60_000);
    await expect(requireAdmin()).rejects.toThrow("Нэвтрэх шаардлагатай");
  });

  it("хугацаа дууссан cookie-г татгалзана", async () => {
    cookieValue = signSession(SECRET, Date.now() - 1000);
    await expect(requireAdmin()).rejects.toThrow("Нэвтрэх шаардлагатай");
  });

  it("зөв гарын үсэгтэй, хүчинтэй cookie-г нэвтрүүлнэ", async () => {
    cookieValue = signSession(SECRET, Date.now() + 60_000);
    await expect(requireAdmin()).resolves.toBeUndefined();
    expect(await isAdmin()).toBe(true);
  });
});
