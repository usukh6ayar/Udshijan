import type { ProductRow } from "@/drizzle/schema";
import type { Product } from "./types";

/** DB-ийн NULL → Product-ийн undefined */
function opt<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/** DB-д гэмтэлтэй утга байсан ч Product-ийн нарийн төрлийг зөрчихгүй */
function section(value: string | null): Product["section"] {
  return value === "eregtei" || value === "emegtei" ? value : null;
}

/**
 * DB мөрийг Product гэрээ рүү хөрвүүлнэ.
 *
 * stock эрх мэдэлтэй: stock <= 0 бол бүх хэмжээ дууссан гэж үзнэ.
 * Ингэснээр DB-д зөрүүтэй JSON байсан ч дэлгүүр буруу үлдэгдэл харуулахгүй.
 */
export function rowToProduct(row: ProductRow): Product {
  const sizes =
    row.stock <= 0
      ? row.sizes.map((s) => ({ ...s, inStock: false }))
      : row.sizes;

  return {
    slug: row.slug,
    sku: row.sku,
    brand: row.brand,
    title: row.title,
    titleFull: opt(row.titleFull),
    category: row.category,
    subcategory: row.subcategory,
    section: section(row.section),
    price: row.price,
    compareAt: opt(row.compareAt),
    rating: row.rating,
    reviewCount: row.reviewCount,
    soldCount: opt(row.soldCount),
    colors: row.colors,
    sizes,
    stock: row.stock,
    wholesale: opt(row.wholesale),
    imageLabel: row.imageLabel,
    imageCount: row.imageCount,
    description: row.description,
    descriptionNotes: opt(row.descriptionNotes),
    specs: row.specs,
    badges: opt(row.badges),
    featured: opt(row.featured),
  };
}
