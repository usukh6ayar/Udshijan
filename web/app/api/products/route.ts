import { productsBySlugs } from "@/lib/data/products";

/** Клиент талын сагс/хүслийн store бүтээгдэхүүнээ энд хандаж resolve хийнэ */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("slugs");
  const slugs = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return Response.json(await productsBySlugs(slugs));
}
