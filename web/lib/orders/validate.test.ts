import { describe, expect, it } from "vitest";
import {
  INITIAL_CHECKOUT,
  parseCheckoutForm,
  validateCheckout,
  type CheckoutForm,
} from "./validate";

const valid: CheckoutForm = {
  ...INITIAL_CHECKOUT,
  name: "Бат Болд",
  phone: "9911-2233",
  khoroo: "4-р хороо",
  address: "45-р байр, 18 тоот",
  terms: true,
};

describe("validateCheckout", () => {
  it("зөв формыг хүлээн авна", () => {
    expect(validateCheckout(valid)).toEqual({});
  });

  it("8 оронгүй утсыг татгалзана", () => {
    expect(validateCheckout({ ...valid, phone: "991122" }).phone).toBeTruthy();
  });

  it("салбараас авахад хаяг шаардахгүй", () => {
    const f = { ...valid, shipping: "pickup" as const, khoroo: "", address: "" };
    expect(validateCheckout(f)).toEqual({});
  });

  it("хүргэлттэй үед хороо, хаяг шаардана", () => {
    const e = validateCheckout({ ...valid, khoroo: "", address: "" });
    expect(e.khoroo).toBeTruthy();
    expect(e.address).toBeTruthy();
  });

  it("жагсаалтад байхгүй хот, төлбөр, хүргэлтийг татгалзана", () => {
    const e = validateCheckout({
      ...valid,
      city: "Парис",
      payment: "bitcoin" as CheckoutForm["payment"],
      shipping: "drone" as CheckoutForm["shipping"],
    });
    expect(e.city).toBeTruthy();
    expect(e.payment).toBeTruthy();
    expect(e.shipping).toBeTruthy();
  });

  it("хэт урт тэмдэглэлийг татгалзана", () => {
    expect(validateCheckout({ ...valid, note: "а".repeat(1001) }).note).toBeTruthy();
  });

  it("нөхцөл зөвшөөрөөгүйг татгалзана", () => {
    expect(validateCheckout({ ...valid, terms: false }).terms).toBeTruthy();
  });
});

describe("parseCheckoutForm", () => {
  it("үл итгэх оролтоос зөвхөн мөр талбаруудыг авна", () => {
    const f = parseCheckoutForm({ name: "Бат", phone: 99112233, terms: "yes" });
    expect(f.name).toBe("Бат");
    expect(f.phone).toBe("");
    expect(f.terms).toBe(false);
  });

  it("объект биш оролтод анхны утга", () => {
    expect(parseCheckoutForm(null)).toEqual({ ...INITIAL_CHECKOUT });
  });
});
