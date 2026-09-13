"use client";

import { useMemo } from "react";
import { ProductBrowser } from "./ProductBrowser";
import type { Category, Product } from "@/lib/data/types";

/** Ангилалын хуудас — `ProductBrowser`-ыг тухайн ангилалын бараагаар хязгаарлана */
export function CategoryView({
  category,
  section,
  title,
  products,
}: {
  category: Category;
  section: string | null;
  title: string;
  /** Бүх бараа — DB-ээс сервер тал татаж өгнө */
  products: Product[];
}) {
  const pool = useMemo(
    () =>
      products.filter(
        (p) =>
          p.category === category.slug && (!section || p.section === section),
      ),
    [products, category.slug, section],
  );

  return (
    <ProductBrowser
      pool={pool}
      basePath={`/c/${category.slug}`}
      keepParams={section ? { section } : undefined}
      title={title}
      category={category}
      breadcrumb={[
        { label: "Нүүр", href: "/" },
        { label: category.name, href: `/c/${category.slug}` },
        ...(section
          ? [
              {
                label: title.replace(` ${category.name.toLowerCase()}`, ""),
              },
            ]
          : []),
      ]}
    />
  );
}
