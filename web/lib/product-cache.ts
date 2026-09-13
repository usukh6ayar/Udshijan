"use client";

import { useEffect, useState } from "react";
import type { Product } from "./data/types";

/** Тогтвортой хоосон утга — useMemo-гийн хамаарал шаардлагагүй байхад өөрчлөгдөхгүй */
const EMPTY: Map<string, Product> = new Map();

/**
 * Сагс/хүслийн жагсаалтад буй slug-уудын Product мэдээллийг сервертээс татаж
 * кэшэлнэ. localStorage зөвхөн slug хадгалдаг тул энэ давхарга шаардлагатай.
 */
export function useProductCache(slugs: string[]): Map<string, Product> {
  const [cache, setCache] = useState<Map<string, Product>>(EMPTY);
  const key = slugs.slice().sort().join(",");

  useEffect(() => {
    /* Хоосон үед setState дуудахгүй (effect дотор синхрон setState нь илүүдэл
       render үүсгэнэ) — оронд нь доор EMPTY-г шууд буцаана. */
    if (!key) return;

    let cancelled = false;
    fetch(`/api/products?slugs=${encodeURIComponent(key)}`)
      .then((r) => r.json() as Promise<Product[]>)
      .then((list) => {
        if (cancelled) return;
        setCache(new Map(list.map((p) => [p.slug, p])));
      })
      .catch(() => {
        if (!cancelled) setCache(EMPTY);
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return key ? cache : EMPTY;
}
