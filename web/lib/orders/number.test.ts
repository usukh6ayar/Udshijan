import { describe, expect, it } from "vitest";
import { makeOrderNumber, normalizeOrderNumber } from "./number";

describe("makeOrderNumber", () => {
  it("огноог Улаанбаатарын цагаар авна (UTC+8)", () => {
    // UTC 17:00 = Улаанбаатарт маргаашийн 01:00
    const n = makeOrderNumber(new Date("2026-09-30T17:00:00Z"), () => 0.0421);
    expect(n).toBe("UDS-261001-0421");
  });

  it("сүүлийн 4 орон 0000–9999", () => {
    expect(makeOrderNumber(new Date("2026-10-01T03:00:00Z"), () => 0)).toBe(
      "UDS-261001-0000",
    );
    expect(
      makeOrderNumber(new Date("2026-10-01T03:00:00Z"), () => 0.99999),
    ).toBe("UDS-261001-9999");
  });
});

describe("normalizeOrderNumber", () => {
  it("жижиг үсэг, зайг засна", () => {
    expect(normalizeOrderNumber("  uds-261001-0421 ")).toBe("UDS-261001-0421");
  });

  it("буруу хэлбэрт null", () => {
    expect(normalizeOrderNumber("UDS-2610-0421")).toBeNull();
    expect(normalizeOrderNumber("")).toBeNull();
  });
});
