"use client";

import { useMemo } from "react";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductBrowser } from "./ProductBrowser";
import { POPULAR_QUERIES, searchProducts } from "@/lib/search";

/** `/hailt?q=…` — илэрцийг ангилалын хуудастай ижил шүүлтүүртэйгээр харуулна */
export function SearchView({ query }: { query: string }) {
  const pool = useMemo(() => searchProducts(query), [query]);

  return (
    <ProductBrowser
      pool={pool}
      basePath="/hailt"
      keepParams={{ q: query }}
      title={`«${query}» хайлтын илэрц`}
      breadcrumb={[
        { label: "Нүүр", href: "/" },
        { label: "Хайлт", href: "/hailt" },
        { label: query },
      ]}
      emptyState={
        <div className="rounded-card border border-line bg-white">
          <EmptyState
            icon={<SearchX className="size-6" />}
            title={`«${query}» гэсэн илэрц олдсонгүй`}
            description="Үгээ цөөлж, эсвэл бичилтээ шалгаад дахин оролдоно уу."
          />
          <div className="px-6 pb-8">
            <p className="text-center text-small text-ink-2">
              Түгээмэл хайлтууд:
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
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
            <div className="mt-6 flex justify-center">
              <ButtonLink href="/c/huvtsas" variant="secondary">
                Бүх бараа харах
              </ButtonLink>
            </div>
          </div>
        </div>
      }
    />
  );
}
