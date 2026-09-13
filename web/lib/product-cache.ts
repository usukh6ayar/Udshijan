"use client";

import { useEffect, useState } from "react";
import type { Product } from "./data/types";

/**
 * Сагс/хүслийн жагсаалтад буй slug-уудын Product мэдээллийг сервертээс татаж
 * кэшэлнэ. localStorage зөвхөн slug хадгалдаг тул энэ давхарга шаардлагатай.
 */
export function useProductCache(slugs: string[]): Map<string, Product> {
  const [cache, setCache] = useState<Map<string, Product>>(new Map());
  const key = slugs.slice().sort().join(",");

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    if (wanted.length === 0) {
      setCache(new Map());
      return;
    }

    let cancelled = false;
    fetch(`/api/products?slugs=${encodeURIComponent(wanted.join(","))}`)
      .then((r) => r.json() as Promise<Product[]>)
      .then((list) => {
        if (cancelled) return;
        setCache(new Map(list.map((p) => [p.slug, p])));
      })
      .catch(() => {
        if (!cancelled) setCache(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return cache;
}
