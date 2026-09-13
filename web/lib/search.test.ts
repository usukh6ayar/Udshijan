import { describe, expect, it } from "vitest";
import { searchProducts } from "./search";
import type { Product } from "./data/types";

const sample = [
  {
    slug: "a",
    sku: "1",
    brand: "UDS Basic",
    title: "Эрэгтэй хөвөн футболк",
    category: "huvtsas",
    subcategory: "futbolk",
    price: 1,
    rating: 5,
    reviewCount: 1,
    colors: [],
    sizes: [],
    stock: 1,
    imageLabel: "футболк",
    imageCount: 1,
    description: "",
    specs: [],
  },
] as unknown as Product[];

describe("searchProducts", () => {
  it("жагсаалтыг параметрээр авч хайна", () => {
    expect(searchProducts(sample, "футболк").map((p) => p.slug)).toEqual(["a"]);
  });

  it("илэрцгүй үед хоосон буцаана", () => {
    expect(searchProducts(sample, "гутал")).toEqual([]);
  });
});
