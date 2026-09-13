import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data/products", () => ({
  productsBySlugs: async (slugs: string[]) =>
    slugs.map((slug) => ({ slug, title: `Бараа ${slug}` })),
}));

const { GET } = await import("./route");

describe("GET /api/products", () => {
  it("slugs параметрээр хүссэн барааг буцаана", async () => {
    const res = await GET(
      new Request("http://localhost/api/products?slugs=a,b"),
    );
    const body = await res.json();

    expect(body.map((p: { slug: string }) => p.slug)).toEqual(["a", "b"]);
  });

  it("slugs байхгүй бол хоосон массив буцаана", async () => {
    const res = await GET(new Request("http://localhost/api/products"));

    expect(await res.json()).toEqual([]);
  });
});
