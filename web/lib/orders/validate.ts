/**
 * Checkout формын шалгалт — клиент (шууд алдаа харуулах) ба сервер
 * (`placeOrder`, жинхэнэ хил) хоёул ажиллуулна. Цэвэр байх ёстой.
 */
import type { ShippingMethod } from "@/lib/pricing";
import { PAYMENT_KEYS, type PaymentMethod } from "./types";

/** Дизайны footer дээрх хаягтай нийцүүлсэн жагсаалт */
export const CITIES = [
  "Улаанбаатар",
  "Дархан-Уул",
  "Орхон",
  "Сэлэнгэ",
  "Төв",
  "Бусад аймаг",
];

export const DISTRICTS = [
  "Баянгол",
  "Баянзүрх",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Сүхбаатар",
  "Чингэлтэй",
  "Налайх",
  "Багануур",
  "Багахангай",
];

export const SHIPPING_KEYS: ShippingMethod[] = ["standard", "express", "pickup"];

export type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  khoroo: string;
  address: string;
  note: string;
  shipping: ShippingMethod;
  payment: PaymentMethod;
  terms: boolean;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export const INITIAL_CHECKOUT: CheckoutForm = {
  name: "",
  phone: "",
  email: "",
  city: CITIES[0],
  district: DISTRICTS[0],
  khoroo: "",
  address: "",
  note: "",
  shipping: "standard",
  payment: "qpay",
  terms: false,
};

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {};

  const name = form.name.trim();
  if (name.length < 2) errors.name = "Нэрээ бүтэн бичнэ үү.";
  else if (name.length > 100) errors.name = "Нэр хэт урт байна.";

  if (phoneDigits(form.phone).length !== 8) {
    errors.phone = "Утасны дугаар 8 оронтой байх ёстой.";
  }

  const email = form.email.trim();
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = "И-мэйл хаяг буруу байна.";
  }

  if (!SHIPPING_KEYS.includes(form.shipping)) {
    errors.shipping = "Хүргэлтийн арга сонгоно уу.";
  }
  if (!PAYMENT_KEYS.includes(form.payment)) {
    errors.payment = "Төлбөрийн арга сонгоно уу.";
  }

  // Салбараас авах үед хүргэлтийн хаяг шаардлагагүй
  if (form.shipping !== "pickup") {
    if (!CITIES.includes(form.city)) errors.city = "Хот, аймгаа сонгоно уу.";
    if (!DISTRICTS.includes(form.district)) {
      errors.district = "Дүүрэг, сумаа сонгоно уу.";
    }
    const khoroo = form.khoroo.trim();
    if (!khoroo) errors.khoroo = "Хороогоо оруулна уу.";
    else if (khoroo.length > 50) errors.khoroo = "Хэт урт байна.";
    const address = form.address.trim();
    if (address.length < 4) {
      errors.address = "Байр, орц, тоотоо тодорхой бичнэ үү.";
    } else if (address.length > 300) {
      errors.address = "Хаяг хэт урт байна.";
    }
  }

  if (form.note.length > 1000) errors.note = "Тэмдэглэл хэт урт байна.";

  if (!form.terms) errors.terms = "Үйлчилгээний нөхцөлийг зөвшөөрнө үү.";

  return errors;
}

/** Server Action-д ирсэн үл итгэх оролтыг CheckoutForm болгоно */
export function parseCheckoutForm(raw: unknown): CheckoutForm {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (key: keyof CheckoutForm) =>
    typeof src[key] === "string" ? (src[key] as string) : "";

  return {
    name: str("name"),
    phone: str("phone"),
    email: str("email"),
    city: typeof src.city === "string" ? src.city : INITIAL_CHECKOUT.city,
    district:
      typeof src.district === "string" ? src.district : INITIAL_CHECKOUT.district,
    khoroo: str("khoroo"),
    address: str("address"),
    note: str("note"),
    shipping: (typeof src.shipping === "string"
      ? src.shipping
      : INITIAL_CHECKOUT.shipping) as ShippingMethod,
    payment: (typeof src.payment === "string"
      ? src.payment
      : INITIAL_CHECKOUT.payment) as PaymentMethod,
    terms: src.terms === true,
  };
}
