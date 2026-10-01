import { beforeEach, describe, expect, it, vi } from "vitest";

type Stock = Record<
  string,
  { title: string; sku: string; price: number; compareAt: number | null; stock: number }
>;

let stock: Stock;
let draft: Stock;
let saved: Record<string, unknown>[];
let pendingOrders: Record<string, unknown>[];
let insertFailures: number;
let transactions: number;
const cookieJar = new Map<string, string>();
const tags: string[] = [];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string) => cookieJar.set(name, value),
  }),
}));
vi.mock("next/cache", () => ({ updateTag: (t: string) => tags.push(t) }));

/** Transaction-ыг дуурайна: callback шидвэл ноорог хаягдана (rollback) */
vi.mock("@/lib/db", () => ({
  db: {
    transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
      transactions++;
      draft = structuredClone(stock);
      pendingOrders = [];
      const result = await fn({});
      stock = draft;
      saved.push(...pendingOrders);
      return result;
    },
  },
}));

vi.mock("./repo", () => ({
  reserveStock: async (_tx: unknown, slug: string, qty: number) => {
    const p = draft[slug];
    if (!p || p.stock < qty) return null;
    p.stock -= qty;
    return { slug, title: p.title, sku: p.sku, price: p.price, compareAt: p.compareAt };
  },
  stockOf: async (_tx: unknown, slug: string) =>
    draft[slug] ? { title: draft[slug].title, stock: draft[slug].stock } : null,
  insertOrder: async (_tx: unknown, row: Record<string, unknown>) => {
    if (insertFailures > 0) {
      insertFailures--;
      return false;
    }
    pendingOrders.push(row);
    return true;
  },
}));

const { placeOrder } = await import("./actions");

const form = {
  name: "Бат Болд",
  phone: "9911-2233",
  email: "",
  city: "Улаанбаатар",
  district: "Баянгол",
  khoroo: "4-р хороо",
  address: "45-р байр, 18 тоот",
  note: "",
  shipping: "standard",
  payment: "qpay",
  terms: true,
};

beforeEach(() => {
  stock = {
    "bar-a": { title: "Бараа А", sku: "A-1", price: 40_000, compareAt: null, stock: 5 },
    "bar-b": { title: "Бараа Б", sku: "B-1", price: 70_000, compareAt: null, stock: 1 },
  };
  saved = [];
  insertFailures = 0;
  transactions = 0;
  cookieJar.clear();
  tags.length = 0;
});

describe("placeOrder", () => {
  it("захиалга үүсгэж, үлдэгдэл хасаж, DB-ийн үнээр тооцно", async () => {
    const res = await placeOrder({
      form,
      lines: [{ slug: "bar-a", qty: 2, price: 1 }],
      coupon: null,
    });

    expect(res).toMatchObject({ ok: true });
    expect(stock["bar-a"].stock).toBe(3);
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      subtotal: 80_000,
      shippingFee: 5_000,
      total: 85_000,
      phone: "99112233",
      status: "new",
    });
  });

  it("купоныг серверт тооцно", async () => {
    await placeOrder({ form, lines: [{ slug: "bar-a", qty: 3 }], coupon: "naim8" });
    expect(saved[0]).toMatchObject({
      subtotal: 120_000,
      couponCode: "NAIM8",
      couponDiscount: 18_000,
      total: 102_000,
    });
  });

  it("үлдэгдэл хүрэлцэхгүй бол бүгдийг буцаана", async () => {
    const res = await placeOrder({
      form,
      lines: [
        { slug: "bar-a", qty: 1 },
        { slug: "bar-b", qty: 2 },
      ],
      coupon: null,
    });

    expect(res.ok).toBe(false);
    expect(res.ok === false && res.problems?.[0]).toContain("ердөө 1 ширхэг");
    expect(stock["bar-a"].stock).toBe(5);
    expect(saved).toHaveLength(0);
  });

  it("DB-д байхгүй барааг нэрлэж татгалзана", async () => {
    const res = await placeOrder({ form, lines: [{ slug: "alga", qty: 1 }], coupon: null });
    expect(res.ok === false && res.problems?.[0]).toContain("зарагдахаа больсон");
  });

  it("ижил барааны хоёр мөрийг нэгтгэж хасна", async () => {
    await placeOrder({
      form,
      lines: [
        { slug: "bar-a", qty: 2, size: "M" },
        { slug: "bar-a", qty: 3, size: "L" },
      ],
      coupon: null,
    });
    expect(stock["bar-a"].stock).toBe(0);
    expect((saved[0].items as unknown[]).length).toBe(2);
  });

  it("буруу формд transaction эхлүүлэхгүй", async () => {
    const res = await placeOrder({
      form: { ...form, phone: "123" },
      lines: [{ slug: "bar-a", qty: 1 }],
      coupon: null,
    });
    expect(res.ok === false && res.errors?.phone).toBeTruthy();
    expect(transactions).toBe(0);
  });

  it("дугаар давхардвал дахин оролдоно", async () => {
    insertFailures = 2;
    const res = await placeOrder({ form, lines: [{ slug: "bar-a", qty: 1 }], coupon: null });
    expect(res.ok).toBe(true);
    expect(saved).toHaveLength(1);
  });

  it("захиалагчид cookie тавьж, кэшийн тагуудыг дуусгана", async () => {
    const res = await placeOrder({ form, lines: [{ slug: "bar-a", qty: 1 }], coupon: null });
    if (!res.ok) throw new Error("амжилттай байх ёстой");
    expect(cookieJar.get(`udshijan_order_${res.number}`)).toBe(saved[0].accessKey);
    expect(tags).toEqual(expect.arrayContaining(["products", "product-bar-a"]));
  });
});
