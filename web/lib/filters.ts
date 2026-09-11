import type { Product } from "./data/types";

export type SortKey = "sanal" | "shine" | "une-oss" | "une-buu" | "unelgee";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "sanal", label: "Санал болгосон" },
  { key: "shine", label: "Шинэ эхэндээ" },
  { key: "une-oss", label: "Үнэ: багаас их" },
  { key: "une-buu", label: "Үнэ: ихээс бага" },
  { key: "unelgee", label: "Үнэлгээ өндөр" },
];

export type FilterState = {
  /** Ангилалын slug — зөвхөн хайлтын хуудсанд ашиглана (`/c/[slug]` дээр зам нь өөрөө заана) */
  cat: string | null;
  sub: string | null;
  brands: string[];
  colors: string[];
  sizes: string[];
  priceMin: number | null;
  priceMax: number | null;
  inStock: boolean;
  sale: boolean;
  wholesale: boolean;
  rating: number | null;
  sort: SortKey;
  page: number;
};

export const EMPTY_FILTERS: FilterState = {
  cat: null,
  sub: null,
  brands: [],
  colors: [],
  sizes: [],
  priceMin: null,
  priceMax: null,
  inStock: false,
  sale: false,
  wholesale: false,
  rating: null,
  sort: "sanal",
  page: 1,
};

export const PAGE_SIZE = 48;

export function parseFilters(sp: URLSearchParams): FilterState {
  const list = (key: string) => sp.get(key)?.split(",").filter(Boolean) ?? [];
  const int = (key: string) => {
    const raw = sp.get(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  return {
    cat: sp.get("ang"),
    sub: sp.get("sub"),
    brands: list("brand"),
    colors: list("ongo"),
    sizes: list("razmer"),
    priceMin: int("une_min"),
    priceMax: int("une_max"),
    inStock: sp.get("uldegdel") === "1",
    sale: sp.get("hyamdral") === "1",
    wholesale: sp.get("boon") === "1",
    rating: int("unelgee"),
    sort: (SORT_OPTIONS.find((o) => o.key === sp.get("erembe"))?.key ??
      "sanal") as SortKey,
    page: Math.max(1, int("page") ?? 1),
  };
}

export function serializeFilters(f: FilterState): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.cat) sp.set("ang", f.cat);
  if (f.sub) sp.set("sub", f.sub);
  if (f.brands.length) sp.set("brand", f.brands.join(","));
  if (f.colors.length) sp.set("ongo", f.colors.join(","));
  if (f.sizes.length) sp.set("razmer", f.sizes.join(","));
  if (f.priceMin !== null) sp.set("une_min", String(f.priceMin));
  if (f.priceMax !== null) sp.set("une_max", String(f.priceMax));
  if (f.inStock) sp.set("uldegdel", "1");
  if (f.sale) sp.set("hyamdral", "1");
  if (f.wholesale) sp.set("boon", "1");
  if (f.rating !== null) sp.set("unelgee", String(f.rating));
  if (f.sort !== "sanal") sp.set("erembe", f.sort);
  if (f.page > 1) sp.set("page", String(f.page));
  return sp;
}

/** Идэвхтэй шүүлтүүрийн тоо — дизайны "3 шүүлтүүр активтай" */
export function activeFilterCount(f: FilterState): number {
  return (
    f.brands.length +
    f.colors.length +
    f.sizes.length +
    (f.cat ? 1 : 0) +
    (f.sub ? 1 : 0) +
    (f.priceMin !== null || f.priceMax !== null ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.sale ? 1 : 0) +
    (f.wholesale ? 1 : 0) +
    (f.rating !== null ? 1 : 0)
  );
}

export function applyFilters(products: Product[], f: FilterState): Product[] {
  const filtered = products.filter((p) => {
    if (f.cat && p.category !== f.cat) return false;
    if (f.sub && p.subcategory !== f.sub) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.colors.length && !p.colors.some((c) => f.colors.includes(c.name)))
      return false;
    if (
      f.sizes.length &&
      !p.sizes.some((s) => s.inStock && f.sizes.includes(s.label))
    )
      return false;
    if (f.priceMin !== null && p.price < f.priceMin) return false;
    if (f.priceMax !== null && p.price > f.priceMax) return false;
    if (f.inStock && p.stock === 0) return false;
    if (f.sale && !p.compareAt) return false;
    if (f.wholesale && !p.wholesale) return false;
    if (f.rating !== null && p.rating < f.rating) return false;
    return true;
  });

  return sortProducts(filtered, f.sort);
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const out = [...products];
  switch (sort) {
    case "une-oss":
      return out.sort((a, b) => a.price - b.price);
    case "une-buu":
      return out.sort((a, b) => b.price - a.price);
    case "unelgee":
      return out.sort((a, b) => b.rating - a.rating);
    case "shine":
      return out.sort(
        (a, b) =>
          Number(b.featured?.includes("new") ?? false) -
          Number(a.featured?.includes("new") ?? false),
      );
    default:
      return out.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}
