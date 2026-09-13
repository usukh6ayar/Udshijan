export type ProductFormInput = Record<string, string>;
export type FormErrors = Record<string, string>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Зөвхөн "0", "12" мэтийн цэвэр бүхэл тоо. Хоосон утга ч алдаа. */
function positiveInt(value: string): number | null {
  return /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
}

export function validateProductForm(input: ProductFormInput): {
  errors: FormErrors;
} {
  const errors: FormErrors = {};

  if (!SLUG_RE.test(input.slug ?? "")) {
    errors.slug = "Зөвхөн жижиг үсэг, тоо, зураас ашиглана";
  }
  for (const field of [
    "sku",
    "brand",
    "title",
    "category",
    "subcategory",
    "imageLabel",
    "description",
  ]) {
    if (!(input[field] ?? "").trim()) errors[field] = "Заавал бөглөнө";
  }
  if (positiveInt(input.price ?? "") === null) {
    errors.price = "Үнэ сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.stock ?? "") === null) {
    errors.stock = "Үлдэгдэл сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.imageCount ?? "") === null) {
    errors.imageCount = "Зургийн тоо сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.reviewCount ?? "") === null) {
    errors.reviewCount = "Сэтгэгдлийн тоо сөрөг биш бүхэл тоо байна";
  }
  const ratingRaw = (input.rating ?? "").trim();
  const rating = Number(ratingRaw);
  if (ratingRaw === "" || !Number.isFinite(rating) || rating < 0 || rating > 5) {
    errors.rating = "Үнэлгээ 0–5 хооронд байна";
  }

  return { errors };
}
