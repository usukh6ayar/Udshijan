import { beforeEach, describe, expect, it, vi } from "vitest";

const ORDER = {
  number: "UDS-261001-0421",
  phone: "99112233",
  accessKey: "a".repeat(43),
};
const cookieJar = new Map<string, string>();
const paid: { number: string; via: string }[] = [];
let findCalls = 0;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined,
    set: (name: string, value: string) => cookieJar.set(name, value),
  }),
}));
vi.mock("next/cache", () => ({ updateTag: () => {} }));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("./repo", () => ({
  findOrder: async (number: string) => {
    findCalls++;
    return number === ORDER.number ? { ...ORDER } : null;
  },
  markPaid: async (number: string, via: string) => {
    paid.push({ number, via });
    return true;
  },
}));

const { lookupOrder, markDemoPaid } = await import("./actions");

beforeEach(() => {
  cookieJar.clear();
  paid.length = 0;
  findCalls = 0;
});

describe("lookupOrder", () => {
  it("дугаар, утас таарвал cookie тавина", async () => {
    const res = await lookupOrder({ number: "uds-261001-0421", phone: "9911-2233" });
    expect(res).toEqual({ ok: true, number: ORDER.number });
    expect(cookieJar.get(`udshijan_order_${ORDER.number}`)).toBe(ORDER.accessKey);
  });

  it("утас буруу, дугаар байхгүй хоёрт ИЖИЛ хариу", async () => {
    const wrongPhone = await lookupOrder({ number: ORDER.number, phone: "99999999" });
    const noOrder = await lookupOrder({ number: "UDS-261001-9999", phone: "99112233" });
    expect(wrongPhone).toEqual({ ok: false });
    expect(noOrder).toEqual({ ok: false });
    expect(cookieJar.size).toBe(0);
  });

  it("буруу хэлбэрийн дугаараар DB рүү хандахгүй", async () => {
    expect(await lookupOrder({ number: "хог", phone: "99112233" })).toEqual({ ok: false });
    expect(findCalls).toBe(0);
  });
});

describe("markDemoPaid", () => {
  it("cookie-гүй үед татгалзана", async () => {
    expect(await markDemoPaid(ORDER.number)).toEqual({ ok: false });
    expect(paid).toEqual([]);
  });

  it("зөв cookie-тэй үед demo гэж тэмдэглэнэ", async () => {
    cookieJar.set(`udshijan_order_${ORDER.number}`, ORDER.accessKey);
    expect(await markDemoPaid(ORDER.number)).toEqual({ ok: true });
    expect(paid).toEqual([{ number: ORDER.number, via: "demo" }]);
  });
});
