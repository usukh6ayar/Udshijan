"use client";

import { useMemo } from "react";
import { ProductBrowser } from "./ProductBrowser";
import { products as allProducts } from "@/lib/data/products";
import type { Category } from "@/lib/data/types";

/** Ангилалын хуудас — `ProductBrowser`-ыг тухайн ангилалын бараагаар хязгаарлана */
export function CategoryView({
  category,
  section,
  title,
}: {
  category: Category;
  section: string | null;
  title: string;
}) {
  const pool = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.category === category.slug && (!section || p.section === section),
      ),
    [category.slug, section],
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
