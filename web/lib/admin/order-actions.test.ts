import { beforeEach, describe, expect, it, vi } from "vitest";

let admin: boolean;
let order: { number: string; status: string; items: { slug: string; qty: number }[] };
const restocked: { slug: string; qty: number }[] = [];
const paid: string[] = [];
const tags: string[] = [];

vi.mock("./session", () => ({
  requireAdmin: async () => {
    if (!admin) throw new Error("Нэвтрэх шаардлагатай");
  },
}));
vi.mock("next/cache", () => ({
  updateTag: (t: string) => tags.push(t),
  refresh: () => {},
}));
vi.mock("@/lib/db", () => ({
  db: { transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}) },
}));
vi.mock("@/lib/orders/repo", () => ({
  leaveNewStatus: async (_exec: unknown, number: string, status: string) => {
    if (number !== order.number || order.status !== "new") return null;
    order.status = status;
    return { ...order };
  },
  restock: async (_tx: unknown, slug: string, qty: number) => {
    restocked.push({ slug, qty });
  },
  markPaid: async (number: string) => {
    paid.push(number);
    return true;
  },
}));

const { adminCancelOrder, adminCompleteOrder, adminMarkPaid } = await import(
  "./order-actions"
);

function fd(number: string): FormData {
  const f = new FormData();
  f.set("number", number);
  return f;
}

const N = "UDS-261001-0421";

beforeEach(() => {
  admin = true;
  order = {
    number: N,
    status: "new",
    items: [
      { slug: "bar-a", qty: 2 },
      { slug: "bar-a", qty: 1 },
      { slug: "bar-b", qty: 1 },
    ],
  };
  restocked.length = 0;
  paid.length = 0;
  tags.length = 0;
});

describe("admin захиалгын action", () => {
  it("нэвтрээгүй үед юу ч өөрчлөхгүй", async () => {
    admin = false;
    await expect(adminCancelOrder(fd(N))).rejects.toThrow("Нэвтрэх шаардлагатай");
    await expect(adminMarkPaid(fd(N))).rejects.toThrow();
    expect(order.status).toBe("new");
    expect(paid).toEqual([]);
  });

  it("цуцлахад үлдэгдлийг барааны түвшинд буцааж нэмнэ", async () => {
    await adminCancelOrder(fd(N));
    expect(order.status).toBe("cancelled");
    expect(restocked).toEqual([
      { slug: "bar-a", qty: 3 },
      { slug: "bar-b", qty: 1 },
    ]);
    expect(tags).toEqual(expect.arrayContaining(["products", "product-bar-a"]));
  });

  it("хоёр дахь цуцлалт үлдэгдлийг дахин нэмэхгүй", async () => {
    await adminCancelOrder(fd(N));
    await adminCancelOrder(fd(N));
    expect(restocked).toHaveLength(2);
  });

  it("дууссан захиалгыг цуцлахгүй", async () => {
    await adminCompleteOrder(fd(N));
    await adminCancelOrder(fd(N));
    expect(order.status).toBe("done");
    expect(restocked).toEqual([]);
  });

  it("төлбөрийг admin гэж тэмдэглэнэ", async () => {
    await adminMarkPaid(fd(N));
    expect(paid).toEqual([N]);
  });
});
