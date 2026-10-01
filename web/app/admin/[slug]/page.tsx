import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteProduct } from "@/lib/admin/actions";
import { requireAdminPage } from "@/lib/admin/session";
import { productBySlug } from "@/lib/data/products";
import { ProductForm } from "../ProductForm";

/**
 * params-ыг хуудасны дээд талд await хийхгүй — Cache Components асаалттай үед
 * тэр нь статик бүрхүүлийг устгаж, prerender алдаа өгнө. Promise-ыг Suspense
 * хилийн дотор оруулж энд await хийнэ.
 */
async function FormContent({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdminPage();
  const { slug } = await params;
  const product = await productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductForm product={product} />

      <form action={deleteProduct} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="slug" value={product.slug} />
        <button
          type="submit"
          className="text-small font-medium text-danger underline underline-offset-2"
        >
          Энэ бүтээгдэхүүнийг устгах
        </button>
      </form>
    </>
  );
}

export default function AdminProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin" className="text-small text-ink-2 hover:underline">
        ← Жагсаалт руу
      </Link>
      <h1 className="mt-3 text-h2">Бүтээгдэхүүн засах</h1>

      <Suspense
        fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}
      >
        <FormContent params={params} />
      </Suspense>
    </main>
  );
}
