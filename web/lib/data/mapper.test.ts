import { describe, expect, it } from "vitest";
import { rowToProduct } from "./mapper";
import type { ProductRow } from "@/drizzle/schema";

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
  it("null утгуудыг undefined болгож Product хэлбэрт оруулна", () => {
    const product = rowToProduct(baseRow);

    expect(product.slug).toBe("test-bar");
    expect(product.titleFull).toBeUndefined();
    expect(product.compareAt).toBeUndefined();
    expect(product.wholesale).toBeUndefined();
    expect(product.badges).toBeUndefined();
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

  it("section-ийг Product-ийн нарийн төрөл рүү хөрвүүлнэ", () => {
    expect(rowToProduct({ ...baseRow, section: "emegtei" }).section).toBe(
      "emegtei",
    );
    expect(rowToProduct({ ...baseRow, section: null }).section).toBeNull();
  });
});
