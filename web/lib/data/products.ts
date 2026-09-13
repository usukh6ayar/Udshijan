import { asc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products as table } from "@/drizzle/schema";
import { rowToProduct } from "./mapper";
import type { Product } from "./types";

/** Бүх бүтээгдэхүүн — slug-аар эрэмбэлсэн, тогтвортой дараалалтай */
export async function allProducts(): Promise<Product[]> {
  const rows = await db.select().from(table).orderBy(asc(table.slug));
  return rows.map(rowToProduct);
}

export async function allProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: table.slug })
    .from(table)
    .orderBy(asc(table.slug));
  return rows.map((r) => r.slug);
}

export async function productBySlug(
  slug: string,
): Promise<Product | undefined> {
  const rows = await db.select().from(table).where(inArray(table.slug, [slug]));
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function productsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db.select().from(table).where(inArray(table.slug, slugs));
  return rows.map(rowToProduct);
}

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
