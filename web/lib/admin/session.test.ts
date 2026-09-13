import { afterEach, describe, expect, it, vi } from "vitest";
import { SESSION_MAX_AGE_MS, sessionCookieOptions } from "./session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sessionCookieOptions", () => {
  it("session cookie-г JS-ээс уншихаас хаана", () => {
    expect(sessionCookieOptions(SESSION_MAX_AGE_MS).httpOnly).toBe(true);
  });

  it("бүх зам дээр ажиллана, cross-site хүсэлтээр илгээгдэхгүй", () => {
    const options = sessionCookieOptions(SESSION_MAX_AGE_MS);

    expect(options.path).toBe("/");
    expect(options.sameSite).toBe("lax");
  });

  it("production дээр зөвхөн HTTPS-ээр илгээгдэнэ", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookieOptions(SESSION_MAX_AGE_MS).secure).toBe(true);
  });

  it("хөгжүүлэлтэд Secure тавихгүй — localhost HTTP дээр ажиллах ёстой", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(sessionCookieOptions(SESSION_MAX_AGE_MS).secure).toBe(false);
  });

  it("маш богино хугацааг 0 секунд болгож хаячихгүй", () => {
    // Math.floor(ms / 1000) нь 1 секундээс бага утгыг 0 болгоно — 0 нь
    // «session cookie» гэсэн утгатай тул санамсаргүй тохиолдвол анзаарагдана.
    expect(sessionCookieOptions(7 * 24 * 60 * 60 * 1000).maxAge).toBe(604800);
  });
});
