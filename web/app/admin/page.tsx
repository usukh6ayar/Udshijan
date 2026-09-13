import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { allProducts } from "@/lib/data/products";
import { logout } from "@/lib/admin/login-action";
import { money } from "@/lib/format";

async function ProductRows() {
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h2">Бүтээгдэхүүн</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/shine" className="text-small font-medium text-brand">
            + Нэмэх
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Гарах
            </Button>
          </form>
        </div>
      </div>

      <Suspense
        fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}
      >
        <ProductRows />
      </Suspense>
    </main>
  );
}
