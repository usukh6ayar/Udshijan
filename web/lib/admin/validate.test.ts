import { describe, expect, it } from "vitest";
import { validateProductForm } from "./validate";

const valid = {
  slug: "shine-bar",
  sku: "UDS-X-1",
  brand: "UDS Basic",
  title: "Шинэ бараа",
  category: "huvtsas",
  subcategory: "futbolk",
  price: "39900",
  stock: "10",
  imageLabel: "футболк",
  imageCount: "3",
  description: "Тайлбар",
  rating: "4.5",
  reviewCount: "10",
};

describe("validateProductForm", () => {
  it("зөв өгөгдлийг хүлээн авна", () => {
    expect(validateProductForm(valid).errors).toEqual({});
  });

  it("сөрөг үнийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, price: "-5" });
    expect(errors.price).toBeTruthy();
  });

  it("хоосон нэрийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, title: "  " });
    expect(errors.title).toBeTruthy();
  });

  it("буруу slug хэлбэрийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, slug: "Буруу Slug!" });
    expect(errors.slug).toBeTruthy();
  });

  it("сөрөг үлдэгдлийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, stock: "-1" });
    expect(errors.stock).toBeTruthy();
  });

  it("хоосон үнийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, price: "" });
    expect(errors.price).toBeTruthy();
  });

  it("хоосон үнэлгээг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, rating: "" });
    expect(errors.rating).toBeTruthy();
  });

  it("бүхэл биш тоон хэлбэрийг татгалзана", () => {
    expect(validateProductForm({ ...valid, price: "0x10" }).errors.price).toBeTruthy();
    expect(validateProductForm({ ...valid, price: "1e5" }).errors.price).toBeTruthy();
    expect(validateProductForm({ ...valid, stock: "5.5" }).errors.stock).toBeTruthy();
  });

  it("зөв section утгыг хүлээн авна", () => {
    expect(validateProductForm({ ...valid, section: "eregtei" }).errors).toEqual({});
    expect(validateProductForm({ ...valid, section: "emegtei" }).errors).toEqual({});
  });

  it("хоосон section-ийг зөвшөөрнө", () => {
    expect(validateProductForm({ ...valid, section: "" }).errors).toEqual({});
  });

  it("танихгүй section утгыг татгалзана", () => {
    expect(validateProductForm({ ...valid, section: "Eregtei" }).errors.section).toBeTruthy();
    expect(validateProductForm({ ...valid, section: "bagachuud" }).errors.section).toBeTruthy();
  });
});
