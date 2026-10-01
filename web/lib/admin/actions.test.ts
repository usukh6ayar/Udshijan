import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Шинэ бүтээгдэхүүн нэмэхэд байгаа slug-ийг давтвал хуучныг нь чимээгүй дарж
 * бичих ёсгүй (spec: «slug давхардахгүй»). Засах үед харин зөвхөн тэр мөрийг
 * шинэчилнэ.
 */

let existing: Set<string>;
const writes: { op: "insert" | "update"; slug: string }[] = [];

vi.mock("./session", () => ({ requireAdmin: async () => {} }));
vi.mock("next/cache", () => ({ revalidateTag: () => {} }));
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

const { saveProduct } = await import("./actions");

function form(mode: "create" | "edit", slug: string): FormData {
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
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  existing = new Set(["baigaa-bar"]);
  writes.length = 0;
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
});
