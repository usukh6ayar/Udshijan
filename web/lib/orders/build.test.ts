import { describe, expect, it } from "vitest";
import {
  MAX_QTY,
  mergeQuantities,
  parseCartLines,
  toOrderItems,
  type ReservedProduct,
} from "./build";

describe("parseCartLines", () => {
  it("зөв мөрүүдийг хүлээн авч илүү талбарыг хаяна", () => {
    const lines = parseCartLines([
      { slug: "bar-a", qty: 2, color: "Хар", size: "L", price: 1 },
    ]);
    expect(lines).toEqual([{ slug: "bar-a", qty: 2, color: "Хар", size: "L" }]);
  });

  it("тоо 1–MAX_QTY бүхэл биш бол бүгдийг татгалзана", () => {
    expect(parseCartLines([{ slug: "a", qty: 0 }])).toBeNull();
    expect(parseCartLines([{ slug: "a", qty: MAX_QTY + 1 }])).toBeNull();
    expect(parseCartLines([{ slug: "a", qty: 1.5 }])).toBeNull();
  });

  it("хоосон, массив биш, буруу slug-ийг татгалзана", () => {
    expect(parseCartLines([])).toBeNull();
    expect(parseCartLines("a")).toBeNull();
    expect(parseCartLines([{ slug: "../x", qty: 1 }])).toBeNull();
  });
});

describe("mergeQuantities", () => {
  it("ижил барааны өөр вариантуудыг нэгтгэнэ", () => {
    const merged = mergeQuantities([
      { slug: "a", qty: 2, size: "M" },
      { slug: "a", qty: 1, size: "L" },
      { slug: "b", qty: 1 },
    ]);
    expect([...merged]).toEqual([
      ["a", 3],
      ["b", 1],
    ]);
  });
});

describe("toOrderItems", () => {
  it("үнэ, нэрийг DB-ээс захиалсан бараанаас авна", () => {
    const reserved = new Map<string, ReservedProduct>([
      ["a", { slug: "a", title: "Бараа А", sku: "A-1", price: 39_900, compareAt: null }],
    ]);
    expect(toOrderItems([{ slug: "a", qty: 2, color: "Хар" }], reserved)).toEqual([
      { slug: "a", title: "Бараа А", sku: "A-1", color: "Хар", qty: 2, unitPrice: 39_900 },
    ]);
  });
});
