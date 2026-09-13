"use client";

import { useEffect, useState } from "react";
import type { Product } from "./data/types";

/** Тогтвортой хоосон утга — useMemo-гийн хамаарал шаардлагагүй байхад өөрчлөгдөхгүй */
const EMPTY: Map<string, Product> = new Map();

export type ProductCache = {
  cache: Map<string, Product>;
  /**
   * Одоогийн slug-уудын хүсэлт дууссан эсэх — АМЖИЛТТАЙ ч, АЛДААТАЙ ч дуусахад
   * үнэн болно. Сүлжээ тасарсан үед эсвэл slug нь DB-д байхгүй болсон үед
   * хэрэглэгч мөнхийн skeleton дээр гацахгүй байх нь энэ талбарын гол зорилго.
   */
  ready: boolean;
};

type State = {
  /** Кэш аль slug-уудын хүсэлтээс үүссэн бэ */
  key: string;
  cache: Map<string, Product>;
};

/**
 * Сагс/хүслийн жагсаалтад буй slug-уудын Product мэдээллийг сервертээс татаж
 * кэшэлнэ. localStorage зөвхөн slug хадгалдаг тул энэ давхарга шаардлагатай.
 */
export function useProductCache(slugs: string[]): ProductCache {
  const [state, setState] = useState<State>({ key: "", cache: EMPTY });
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
        setState({ key, cache: new Map(list.map((p) => [p.slug, p])) });
      })
      .catch(() => {
        /* Алдаа гарсан ч хүсэлт дууссан гэж тэмдэглэнэ. Өмнөх кэшийг хэвээр
           үлдээнэ — устгавал өмнө нь харагдаж байсан сагс хоосорно. */
        if (!cancelled) setState((prev) => ({ key, cache: prev.cache }));
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return {
    cache: key ? state.cache : EMPTY,
    ready: key === "" || state.key === key,
  };
}
