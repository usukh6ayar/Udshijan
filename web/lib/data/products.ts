import { asc, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { products as table } from "@/drizzle/schema";
import { rowToProduct } from "./mapper";
import type { Product } from "./types";

/**
 * Бүх бүтээгдэхүүн — slug-аар эрэмбэлсэн, тогтвортой дараалалтай.
 *
 * Каталог зөвхөн админ засварлахад өөрчлөгддөг тул хугацааны revalidate
 * шаардлагагүй: урт `cacheLife("max")` + `cacheTag` хосыг ашиглаад, засвар
 * хийгдэхэд `revalidateTag("products", "max")`-аар цуцална.
 */
export async function allProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("max");
  cacheTag("products");
  const rows = await db.select().from(table).orderBy(asc(table.slug));
  return rows.map(rowToProduct);
}

/**
 * Зөвхөн `generateStaticParams` энэ функцийг дуудна — build бүрт нэг удаа
 * ажилладаг тул кэшлэх нь ямар ч ашиггүй, иймд `use cache` зориудаар байхгүй.
 */
export async function allProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: table.slug })
    .from(table)
    .orderBy(asc(table.slug));
  return rows.map((r) => r.slug);
}

/**
 * Нэг бүтээгдэхүүн. Ерөнхий `products` тагаас гадна `product-<slug>` таг
 * авдаг тул нэг барааны засвар бусдын кэшийг хөндөхгүй цуцлагдана.
 */
export async function productBySlug(
  slug: string,
): Promise<Product | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag("products");
  cacheTag("product-" + slug);
  const rows = await db.select().from(table).where(inArray(table.slug, [slug]));
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

/**
 * `/api/products`-ийн уншилт — клиент сагс/хүслийн store-ын шууд хэрэгцээ тул
 * зориудаар кэшлэхгүй (slug-ийн массив кэшийн түлхүүр болж хэлбэрэлзэнэ).
 */
export async function productsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db.select().from(table).where(inArray(table.slug, slugs));
  return rows.map(rowToProduct);
}

/**
 * Дотроо `allProducts()`-ыг дуудах тул DB-ийн уншилт нь аль хэдийн кэшлэгдсэн
 * scope-оос ирнэ — өөр дээрээ `use cache` нэмэх шаардлагагүй (шүүлт нь цэвэр
 * тооцоолол). Ингэснээр `products` тагийг цуцлахад энэ хоёр ч мөн шинэчлэгдэнэ.
 */
export async function productsByFeature(
  tag: "bestseller" | "new",
): Promise<Product[]> {
  const all = await allProducts();
  return all.filter((p) => p.featured?.includes(tag));
}

/**
 * PDP-ийн "Ижил төрлийн бараа" — ижил хүйс/ангилал эхэлж, дараа нь бусад.
 * Эрэмбэлэх логик шилжилтийн өмнөхтэй яг ижил.
 */
export async function relatedProducts(
  product: Product,
  limit = 5,
): Promise<Product[]> {
  const all = await allProducts();

  const score = (p: Product) =>
    (p.category === product.category ? 4 : 0) +
    (p.section && p.section === product.section ? 2 : 0) +
    (p.subcategory === product.subcategory ? 1 : 0);

  return all
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a) || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}
