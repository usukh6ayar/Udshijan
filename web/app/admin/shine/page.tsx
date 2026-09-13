import Link from "next/link";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/admin" className="text-small text-ink-2 hover:underline">
        ← Жагсаалт руу
      </Link>
      <h1 className="mt-3 text-h2">Шинэ бүтээгдэхүүн</h1>
      <ProductForm />
    </main>
  );
}
