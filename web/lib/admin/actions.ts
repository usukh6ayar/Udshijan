"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
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
 * болно — алдааг залгихгүй, тухайн талбарын нэрээр `errors`-д бичнэ.
 */
function parseJson<T>(
  input: Record<string, string>,
  field: string,
  fallback: T,
  errors: FormErrors,
): T {
  const trimmed = (input[field] ?? "").trim();
  if (trimmed === "") return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    errors[field] = "JSON буруу бичигдсэн байна";
    return fallback;
  }
}

/**
 * Дэлгүүрийн кэшийг шууд дуусгана.
 *
 * `revalidateTag(tag, "max")` биш: тэр нь stale-while-revalidate тул
 * redirect-ийн дараах /admin болон засах форм хуучин утгаа харуулж, дахин
 * хадгалахад өмнөх засвараа дарж бичих эрсдэлтэй. /admin нь cookie
 * уншдаггүй тул статикаар кэшлэгддэг. `updateTag` нь Server Action-д
 * зориулсан read-your-own-writes хувилбар.
 */
function refresh(slug: string) {
  updateTag("products");
  updateTag("product-" + slug);
}

export async function saveProduct(
  _prev: FormErrors | null,
  formData: FormData,
): Promise<FormErrors | null> {
  await requireAdmin();

  const input = fields(formData);
  const { errors } = validateProductForm(input);
  if (Object.keys(errors).length > 0) return errors;

  const jsonErrors: FormErrors = {};
  const json = <T,>(field: string, fallback: T) =>
    parseJson(input, field, fallback, jsonErrors);

  const row = {
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
    colors: json("colors", []),
    sizes: json("sizes", []),
    wholesale: json("wholesale", null),
    specs: json("specs", []),
    badges: json("badges", null),
    featured: json("featured", null),
    descriptionNotes: json("descriptionNotes", null),
  };
  if (Object.keys(jsonErrors).length > 0) return jsonErrors;

  // Upsert хийхгүй: шинээр нэмэхдээ байгаа slug-ийг давтвал хуучин барааг
  // чимээгүй дарж бичих байсан. Нэмэх, засахыг тусад нь шийднэ.
  if (input.mode === "edit") {
    const updated = await db
      .update(table)
      .set(row)
      .where(eq(table.slug, row.slug))
      .returning({ slug: table.slug });
    if (updated.length === 0) {
      return { slug: "Энэ бүтээгдэхүүн устсан байна — жагсаалт руу буцна уу" };
    }
  } else {
    const inserted = await db
      .insert(table)
      .values(row)
      .onConflictDoNothing()
      .returning({ slug: table.slug });
    if (inserted.length === 0) {
      return { slug: "Энэ slug-тай бүтээгдэхүүн аль хэдийн байна" };
    }
  }

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
