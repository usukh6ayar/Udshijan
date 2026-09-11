import { categories } from "./data/catalog";
import { products } from "./data/products";
import type { Product } from "./data/types";

/**
 * Хайлтын landing дээр гарах түгээмэл хайлтууд.
 * Үг бүр илэрц буцаадаг байх ёстой — хоосон илэрц рүү хөтөлдөг чип тавихгүй.
 */
export const POPULAR_QUERIES = [
  "футболк",
  "цамц",
  "куртка",
  "чихэвч",
  "арьс арчилгаа",
  "гутал",
  "цүнх",
  "гал тогоо",
];

function normalize(value: string): string {
  return value.toLocaleLowerCase("mn-MN").trim();
}

/** Барааны хайлтад оролцох бүх текстийг нэг мөр болгоно */
function haystack(p: Product): string {
  const category = categories.find((c) => c.slug === p.category);
  const sub = category?.subcategories.find((s) => s.slug === p.subcategory);

  return normalize(
    [
      p.title,
      p.titleFull ?? "",
      p.brand,
      p.sku,
      p.description,
      category?.name ?? "",
      sub?.name ?? "",
      ...p.specs.map((s) => `${s.label} ${s.value}`),
    ].join(" "),
  );
}

/**
 * Хоосон зайгаар тусгаарласан үг бүрийг ТУС ТУСАД нь агуулж байх ёстой
 * (ж: "хар футболк" → хар ба футболк хоёулаа таарна).
 */
export function searchProducts(query: string): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return products.filter((p) => {
    const text = haystack(p);
    return terms.every((t) => text.includes(t));
  });
}
