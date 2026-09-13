import Link from "next/link";
import Form from "next/form";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Placeholder } from "@/components/Placeholder";
import { Shell } from "@/components/layout/Shell";
import { Section, SectionHeader } from "@/components/shop/Section";
import { ProductGrid } from "@/components/shop/ProductCard";
import { SearchView } from "@/components/shop/SearchView";
import { categories } from "@/lib/data/catalog";
import { allProducts, productsByFeature } from "@/lib/data/products";
import { POPULAR_QUERIES, searchProducts } from "@/lib/search";
import { num } from "@/lib/format";

function queryOf(search: Record<string, string | string[] | undefined>): string {
  const raw = search.q;
  return (typeof raw === "string" ? raw : "").trim();
}

export async function generateMetadata(
  props: PageProps<"/hailt">,
): Promise<Metadata> {
  const query = queryOf(await props.searchParams);
  return { title: query ? `«${query}» — хайлт` : "Хайлт" };
}

export default async function SearchPage(props: PageProps<"/hailt">) {
  const query = queryOf(await props.searchParams);

  return (
    <Shell mobileTitle="Хайлт" mobileActions="cart">
      {query ? (
        <Suspense fallback={null}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <SearchLanding />
      )}
    </Shell>
  );
}

/**
 * Хайлтыг сервер тал гүйцэтгэж, илэрцийг клиент талын `SearchView` рүү өгнө.
 * DB-ийн хүлээлт Suspense-ийн дотор байхаар тусдаа компонент болгов.
 */
async function SearchResults({ query }: { query: string }) {
  const results = searchProducts(await allProducts(), query);
  return <SearchView query={query} results={results} />;
}

/** Хайлтын үг оруулаагүй үед — хайх талбар, түгээмэл хайлт, ангилалууд */
async function SearchLanding() {
  const bestsellers = await productsByFeature("bestseller");

  return (
    <>
      <section className="container-uds pt-6 lg:pt-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-h2 lg:text-h1">Юу хайж байна вэ?</h1>
          <p className="mt-2 text-body text-ink-2">
            10,000-с дээш нэр төрлийн бараанаас нэрээр, брэндээр эсвэл ангилалаар хайна уу.
          </p>

          <Form action="/hailt" role="search" className="relative mt-6">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-2" />
            <input
              name="q"
              autoFocus
              placeholder="Бараа, брэнд хайх…"
              aria-label="Бараа, брэнд хайх"
              className="h-14 w-full rounded-btn border border-line bg-white pr-28 pl-12 text-body placeholder:text-ink-2 focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute top-2 right-2 inline-flex h-10 items-center rounded-btn bg-brand px-5 text-btn text-white hover:bg-brand-hover"
            >
              Хайх
            </button>
          </Form>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {POPULAR_QUERIES.map((q) => (
              <Link
                key={q}
                href={`/hailt?q=${encodeURIComponent(q)}`}
                className="rounded-btn bg-surface px-3 py-1.5 text-small text-ink hover:bg-brand-tint hover:text-brand"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <SectionHeader title="Ангилалаар үзэх" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="rounded-card border border-line bg-white p-3 transition-shadow hover:shadow-md lg:p-4"
            >
              <Placeholder label={c.imageLabel} ratio="1/1" className="rounded-[6px]" />
              <h3 className="mt-3 text-h3">{c.name}</h3>
              <p className="mt-0.5 text-small text-ink-2">
                {num(c.productCount)} бараа
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Их борлуулалттай бараа"
          subtitle="Сүүлийн 30 хоногийн борлуулалтаар"
        />
        <ProductGrid products={bestsellers} />
      </Section>
    </>
  );
}
