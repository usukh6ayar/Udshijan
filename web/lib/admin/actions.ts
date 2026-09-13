"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products as table } from "@/drizzle/schema";
import { requireAdmin } from "./session";
import { validateProductForm, type FormErrors } from "./validate";

function fields(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/** Хоосон мөрийг null болгоно — DB-д "" биш NULL хадгална */
function orNull(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

function numOrNull(value: string | undefined): number | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : Number(trimmed);
}

/**
 * JSONB талбарууд. Формд түүхий JSON-оор оруулдаг тул задлахад алдаа гарч
 * болно — алдааг залгихгүй, дуудагч нь формд буцаана.
 */
function parseJson<T>(value: string | undefined, fallback: T): T {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") return fallback;
  return JSON.parse(trimmed) as T;
}

/** Дэлгүүрийн кэшийг шинэчилнэ. Хоёр аргумент заавал — нэг нь deprecated. */
function refresh(slug: string) {
  revalidateTag("products", "max");
  revalidateTag("product-" + slug, "max");
}

export async function saveProduct(
  _prev: FormErrors | null,
  formData: FormData,
): Promise<FormErrors | null> {
  await requireAdmin();

  const input = fields(formData);
  const { errors } = validateProductForm(input);
  if (Object.keys(errors).length > 0) return errors;

  let row;
  try {
    row = {
      slug: input.slug.trim(),
      sku: input.sku.trim(),
      brand: input.brand.trim(),
      title: input.title.trim(),
      titleFull: orNull(input.titleFull),
      category: input.category.trim(),
      subcategory: input.subcategory.trim(),
      section: orNull(input.section),
      price: Number(input.price),
      compareAt: numOrNull(input.compareAt),
      rating: Number(input.rating),
      reviewCount: Number(input.reviewCount),
      soldCount: numOrNull(input.soldCount),
      stock: Number(input.stock),
      imageLabel: input.imageLabel.trim(),
      imageCount: Number(input.imageCount),
      description: input.description.trim(),
      colors: parseJson(input.colors, []),
      sizes: parseJson(input.sizes, []),
      wholesale: parseJson(input.wholesale, null),
      specs: parseJson(input.specs, []),
      badges: parseJson(input.badges, null),
      featured: parseJson(input.featured, null),
      descriptionNotes: parseJson(input.descriptionNotes, null),
    };
  } catch {
    return { colors: "JSON талбаруудын аль нэг нь буруу бичигдсэн байна" };
  }

  await db
    .insert(table)
    .values(row)
    .onConflictDoUpdate({ target: table.slug, set: row });

  refresh(row.slug);
  redirect("/admin");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  await db.delete(table).where(eq(table.slug, slug));
  refresh(slug);
  redirect("/admin");
}
