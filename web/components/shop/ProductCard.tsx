"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Placeholder } from "@/components/Placeholder";
import { Badge, Rating } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart";
import { cx, discountPercent, money } from "@/lib/format";
import type { Product } from "@/lib/data/types";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const off = discountPercent(product.price, product.compareAt);
  const soldOut = product.stock === 0;
  const href = `/p/${product.slug}`;

  function onAdd() {
    add({
      slug: product.slug,
      color: product.colors[0]?.name,
      size: product.sizes.find((s) => s.inStock)?.label,
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={href} aria-label={product.title}>
          <Placeholder
            label={product.imageLabel}
            ratio="1/1"
            className={cx("w-full", soldOut && "opacity-60")}
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            {off !== null && <Badge tone="sale">-{off}%</Badge>}
            {soldOut && <Badge tone="outOfStock">Үлдэгдэл дууссан</Badge>}
          </div>
          <button
            type="button"
            onClick={() => setWished((v) => !v)}
            aria-label="Хүслийн жагсаалтад нэмэх"
            aria-pressed={wished}
            className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm hover:bg-surface"
          >
            <Heart className={cx("size-4", wished && "fill-danger text-danger")} />
          </button>
        </div>

        {product.wholesale && !soldOut && (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge tone="wholesale">Бөөний үнэтэй</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 lg:p-4">
        <p className="font-mono text-caption tracking-wider text-ink-2 uppercase">
          {product.brand}
        </p>

        <h3 className="mt-1.5 text-small lg:text-body">
          <Link href={href} className="line-clamp-2 hover:text-brand">
            {product.title}
          </Link>
        </h3>

        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
          <span className="text-h3 lg:text-price">{money(product.price)}</span>
          {product.compareAt && (
            <span className="text-small text-ink-2 line-through">
              {money(product.compareAt)}
            </span>
          )}
        </div>

        {/* Дизайн дээр мобайлын карт дээр товч байхгүй */}
        <div className="mt-auto hidden pt-4 sm:block">
          {soldOut ? (
            <Button variant="tertiary" fullWidth>
              Ирэхэд мэдэгдэх
            </Button>
          ) : (
            <Button variant="secondary" fullWidth onClick={onAdd}>
              {added ? "Сагсанд нэмэгдлээ" : "Сагсанд нэмэх"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  columns = 5,
}: {
  products: Product[];
  columns?: 4 | 5;
}) {
  return (
    <div
      className={cx(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5",
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5",
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
