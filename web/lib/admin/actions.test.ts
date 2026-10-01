import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Шинэ бүтээгдэхүүн нэмэхэд байгаа slug-ийг давтвал хуучныг нь чимээгүй дарж
 * бичих ёсгүй (spec: «slug давхардахгүй»). Засах үед харин зөвхөн тэр мөрийг
 * шинэчилнэ.
 */

let existing: Set<string>;
const writes: { op: "insert" | "update"; slug: string }[] = [];
const expired: string[] = [];

vi.mock("./session", () => ({ requireAdmin: async () => {} }));
vi.mock("next/cache", () => ({
  updateTag: (tag: string) => expired.push(tag),
  // stale-while-revalidate: админ хадгалсныхаа дараа хуучин утга харна
  revalidateTag: () => {},
}));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT");
  },
}));
vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: (row: { slug: string }) => ({
        onConflictDoNothing: () => ({
          returning: async () => {
            if (existing.has(row.slug)) return [];
            existing.add(row.slug);
            writes.push({ op: "insert", slug: row.slug });
            return [{ slug: row.slug }];
          },
        }),
      }),
    }),
    delete: () => ({ where: async () => {} }),
    update: () => ({
      set: (row: { slug: string }) => ({
        where: () => ({
          returning: async () => {
            if (!existing.has(row.slug)) return [];
            writes.push({ op: "update", slug: row.slug });
            return [{ slug: row.slug }];
          },
        }),
      }),
    }),
  },
}));

const { saveProduct, deleteProduct } = await import("./actions");

function form(
  mode: "create" | "edit",
  slug: string,
  extra: Record<string, string> = {},
): FormData {
  const fd = new FormData();
  const values: Record<string, string> = {
    mode,
    slug,
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
  for (const [k, v] of Object.entries({ ...values, ...extra })) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  existing = new Set(["baigaa-bar"]);
  writes.length = 0;
  expired.length = 0;
});

describe("saveProduct", () => {
  it("шинэ slug-тай бүтээгдэхүүнийг нэмнэ", async () => {
    await expect(saveProduct(null, form("create", "shine-bar"))).rejects.toThrow(
      "REDIRECT",
    );
    expect(writes).toEqual([{ op: "insert", slug: "shine-bar" }]);
  });

  it("нэмэх үед байгаа slug-ийг дарж бичихгүй, алдаа буцаана", async () => {
    const errors = await saveProduct(null, form("create", "baigaa-bar"));

    expect(errors?.slug).toBeTruthy();
    expect(writes).toEqual([]);
  });

  it("засах үед байгаа бүтээгдэхүүнийг шинэчилнэ", async () => {
    await expect(saveProduct(null, form("edit", "baigaa-bar"))).rejects.toThrow(
      "REDIRECT",
    );
    expect(writes).toEqual([{ op: "update", slug: "baigaa-bar" }]);
  });

  it("засах үед бүтээгдэхүүн устсан байвал шинээр үүсгэхгүй", async () => {
    const errors = await saveProduct(null, form("edit", "alga-bar"));

    expect(errors?.slug).toBeTruthy();
    expect(writes).toEqual([]);
  });

  it("хадгалсны дараа кэшийг шууд дуусгана — админ хуучин утга харахгүй", async () => {
    await expect(saveProduct(null, form("edit", "baigaa-bar"))).rejects.toThrow(
      "REDIRECT",
    );
    expect(expired).toEqual(["products", "product-baigaa-bar"]);
  });

  it("буруу JSON-ы алдааг тухайн талбарт нь харуулна", async () => {
    const errors = await saveProduct(
      null,
      form("create", "shine-bar", { sizes: "[{буруу" }),
    );

    expect(errors?.sizes).toBeTruthy();
    expect(errors?.colors).toBeUndefined();
    expect(writes).toEqual([]);
  });
});

describe("deleteProduct", () => {
  it("устгасны дараа кэшийг шууд дуусгана", async () => {
    const fd = new FormData();
    fd.set("slug", "baigaa-bar");
    await expect(deleteProduct(fd)).rejects.toThrow("REDIRECT");
    expect(expired).toEqual(["products", "product-baigaa-bar"]);
  });
});
