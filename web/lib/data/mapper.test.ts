import { describe, expect, it } from "vitest";
import { rowToProduct } from "./mapper";
import type { ProductRow } from "@/drizzle/schema";
import type { Product } from "./types";

const baseRow: ProductRow = {
  slug: "test-bar",
  sku: "UDS-T-1",
  brand: "UDS Basic",
  title: "Тест бараа",
  titleFull: null,
  category: "huvtsas",
  subcategory: "futbolk",
  section: "eregtei",
  price: 39900,
  compareAt: null,
  rating: 4.5,
  reviewCount: 10,
  soldCount: null,
  stock: 5,
  imageLabel: "футболк",
  imageCount: 3,
  description: "Тайлбар",
  colors: [{ name: "Хар", hex: "#17171A" }],
  sizes: [
    { label: "S", inStock: true },
    { label: "M", inStock: false },
  ],
  wholesale: null,
  specs: [{ label: "Брэнд", value: "UDS Basic" }],
  badges: null,
  featured: null,
  descriptionNotes: null,
};

describe("rowToProduct", () => {
  it("DB мөрийг бүрэн Product болгож хөрвүүлнэ", () => {
    const product = rowToProduct(baseRow);

    const expected: Product = {
      slug: "test-bar",
      sku: "UDS-T-1",
      brand: "UDS Basic",
      title: "Тест бараа",
      titleFull: undefined,
      category: "huvtsas",
      subcategory: "futbolk",
      section: "eregtei",
      price: 39900,
      compareAt: undefined,
      rating: 4.5,
      reviewCount: 10,
      soldCount: undefined,
      colors: [{ name: "Хар", hex: "#17171A" }],
      sizes: [
        { label: "S", inStock: true },
        { label: "M", inStock: false },
      ],
      stock: 5,
      wholesale: undefined,
      imageLabel: "футболк",
      imageCount: 3,
      description: "Тайлбар",
      descriptionNotes: undefined,
      specs: [{ label: "Брэнд", value: "UDS Basic" }],
      badges: undefined,
      featured: undefined,
    };

    expect(product).toEqual(expected);
  });

  it("stock > 0 үед sizes.inStock-ийг хэвээр үлдээнэ", () => {
    const product = rowToProduct({ ...baseRow, stock: 5 });

    expect(product.sizes).toEqual([
      { label: "S", inStock: true },
      { label: "M", inStock: false },
    ]);
  });

  it("stock === 0 үед бүх size-ийг дууссан болгоно", () => {
    const product = rowToProduct({ ...baseRow, stock: 0 });

    expect(product.sizes.every((s) => s.inStock === false)).toBe(true);
  });

  it("сөрөг үлдэгдлийг ч дууссан гэж үзнэ", () => {
    const product = rowToProduct({ ...baseRow, stock: -3 });
    expect(product.sizes.every((s) => s.inStock === false)).toBe(true);
  });

  it("section-ийг Product-ийн нарийн төрөл рүү хөрвүүлнэ", () => {
    expect(rowToProduct({ ...baseRow, section: "emegtei" }).section).toBe(
      "emegtei",
    );
    expect(rowToProduct({ ...baseRow, section: null }).section).toBeNull();
  });

  it("танихгүй section утгыг null болгоно", () => {
    expect(
      rowToProduct({ ...baseRow, section: "Eregtei" }).section,
    ).toBeNull();
    expect(
      rowToProduct({ ...baseRow, section: "bagachuud" }).section,
    ).toBeNull();
  });
});
