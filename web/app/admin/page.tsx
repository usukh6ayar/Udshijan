import Link from "next/link";
import { Suspense } from "react";
import { allProducts } from "@/lib/data/products";
import { requireAdminPage } from "@/lib/admin/session";
import { money } from "@/lib/format";
import { AdminNav } from "./AdminNav";

async function ProductRows() {
  await requireAdminPage();
  const items = await allProducts();

  return (
    <ul className="mt-6 divide-y divide-line border-y border-line">
      {items.map((p) => (
        <li key={p.slug} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <Link
              href={`/admin/${p.slug}`}
              className="text-body font-medium underline-offset-2 hover:underline"
            >
              {p.title}
            </Link>
            <p className="mt-0.5 truncate text-small text-ink-2">
              {p.sku} · {money(p.price)} · үлдэгдэл {p.stock}
            </p>
          </div>
          {p.stock <= 0 ? (
            <span className="shrink-0 text-small text-danger">Дууссан</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <AdminNav active="products" />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h2">Бүтээгдэхүүн</h1>
        <Link href="/admin/shine" className="text-small font-medium text-brand">
          + Нэмэх
        </Link>
      </div>

      <Suspense
        fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}
      >
        <ProductRows />
      </Suspense>
    </main>
  );
}
