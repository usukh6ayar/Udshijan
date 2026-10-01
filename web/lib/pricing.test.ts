import { describe, expect, it } from "vitest";
import {
  computeTotals,
  couponRate,
  normalizeCoupon,
  shippingFeeFor,
} from "./pricing";

const line = (unitPrice: number, qty: number, compareAt?: number) => ({
  unitPrice,
  qty,
  compareAt,
});

describe("computeTotals", () => {
  it("барааны дүн, хямдралаар хэмнэснийг тооцно", () => {
    const t = computeTotals({ lines: [line(30_000, 2, 40_000), line(10_000, 1)] });
    expect(t.subtotal).toBe(70_000);
    expect(t.savings).toBe(20_000);
  });

  it("купоны хөнгөлөлтийг нийт дүнгээс ХАСНА", () => {
    const t = computeTotals({ lines: [line(200_000, 1)], couponCode: "naim8" });
    expect(t.couponCode).toBe("NAIM8");
    expect(t.couponDiscount).toBe(30_000);
    expect(t.total).toBe(170_000);
  });

  it("хүчингүй купоныг үл тооно", () => {
    const t = computeTotals({ lines: [line(50_000, 1)], couponCode: "BURUU" });
    expect(t.couponCode).toBeNull();
    expect(t.couponDiscount).toBe(0);
    expect(t.total).toBe(55_000);
  });

  it("үнэгүй хүргэлтийн босгыг купоноос ӨМНӨХ дүнгээр шалгана", () => {
    const t = computeTotals({ lines: [line(100_000, 1)], couponCode: "NAIM8" });
    expect(t.shippingFee).toBe(0);
    expect(t.freeShipping).toBe(true);
    expect(t.total).toBe(85_000);
  });

  it("хоосон сагсанд бүх дүн 0", () => {
    const t = computeTotals({ lines: [] });
    expect(t.total).toBe(0);
    expect(t.shippingFee).toBe(0);
    expect(t.freeShipping).toBe(false);
  });

  it("НӨАТ-ыг эцсийн дүнгээс тооцно", () => {
    const t = computeTotals({ lines: [line(110_000, 1)] });
    expect(t.vat).toBe(10_000);
  });
});

describe("shippingFeeFor", () => {
  it("стандарт: босгоос доош 5 000, дээш 0", () => {
    expect(shippingFeeFor("standard", 99_999)).toBe(5_000);
    expect(shippingFeeFor("standard", 100_000)).toBe(0);
  });

  it("шуурхай: дүнгээс үл хамааран 10 000", () => {
    expect(shippingFeeFor("express", 500_000)).toBe(10_000);
  });

  it("салбараас авах: 0", () => {
    expect(shippingFeeFor("pickup", 1_000)).toBe(0);
  });
});

describe("купон", () => {
  it("том жижиг үсэг, хоосон зайг үл тооно", () => {
    expect(normalizeCoupon("  naim8 ")).toBe("NAIM8");
    expect(couponRate("NAIM8")).toBe(0.15);
  });

  it("хүчингүй, хоосон кодонд null / 0", () => {
    expect(normalizeCoupon("")).toBeNull();
    expect(normalizeCoupon(null)).toBeNull();
    expect(couponRate("BURUU")).toBe(0);
  });
});
