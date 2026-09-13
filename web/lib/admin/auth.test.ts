import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "./auth";

const SECRET = "тест-нууц-түлхүүр-хангалттай-урт-утга-2026";

describe("session гарын үсэг", () => {
  it("өөрийн зурсан гарын үсгийг хүлээн авна", () => {
    const token = signSession(SECRET, Date.now() + 60_000);
    expect(verifySession(SECRET, token)).toBe(true);
  });

  it("өөр түлхүүрээр зурсныг татгалзана", () => {
    const token = signSession("өөр-түлхүүр", Date.now() + 60_000);
    expect(verifySession(SECRET, token)).toBe(false);
  });

  it("гарын үсгийг өөрчилсөн токеныг татгалзана", () => {
    const token = signSession(SECRET, Date.now() + 60_000);
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    expect(verifySession(SECRET, tampered)).toBe(false);
  });

  it("хугацаа нь дууссан токеныг татгалзана", () => {
    const token = signSession(SECRET, Date.now() - 1000);
    expect(verifySession(SECRET, token)).toBe(false);
  });

  it("хог утгыг татгалзана", () => {
    expect(verifySession(SECRET, "хог")).toBe(false);
    expect(verifySession(SECRET, "")).toBe(false);
  });

  it("string биш утгыг алдаа шидэлгүй татгалзана", () => {
    expect(verifySession(SECRET, undefined as unknown as string)).toBe(false);
    expect(verifySession(SECRET, null as unknown as string)).toBe(false);
  });
});
