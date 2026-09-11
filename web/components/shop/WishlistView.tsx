"use client";

import { Heart } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "./ProductCard";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { num } from "@/lib/format";

export function WishlistView() {
  const { resolved, count, clear } = useWishlist();
  const { add } = useCart();

  /** Үлдэгдэлтэй бараа бүрийг анхны өнгө/размераар нь сагсанд хийнэ */
  function addAll() {
    for (const p of resolved) {
      if (p.stock === 0) continue;
      add({
        slug: p.slug,
        color: p.colors[0]?.name,
        size: p.sizes.find((s) => s.inStock)?.label,
        qty: 1,
      });
    }
  }

  const available = resolved.filter((p) => p.stock > 0).length;

  return (
    <div className="container-uds pb-10">
      <div className="hidden lg:block">
        <Breadcrumb
          items={[{ label: "Нүүр", href: "/" }, { label: "Хүслийн жагсаалт" }]}
        />
      </div>

      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between lg:pt-2">
        <div>
          <h1 className="hidden text-h1 lg:block">Хүслийн жагсаалт</h1>
          <p className="text-small text-ink-2 lg:mt-1.5">
            {num(count)} бүтээгдэхүүн хадгалсан
          </p>
        </div>

        {count > 0 && (
          <div className="flex flex-wrap gap-3">
            <Button onClick={addAll} disabled={available === 0}>
              Бүгдийг сагсанд нэмэх
            </Button>
            <Button variant="tertiary" onClick={clear}>
              Жагсаалт цэвэрлэх
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {count === 0 ? (
          <div className="rounded-card border border-line bg-white">
            <EmptyState
              icon={<Heart className="size-6" />}
              title="Хүслийн жагсаалт хоосон байна"
              description="Барааны зураг дээрх зүрхэн товчийг дарж дуртай бүтээгдэхүүнээ хадгална уу."
              actionLabel="Бүтээгдэхүүн үзэх"
              actionHref="/c/huvtsas"
            />
          </div>
        ) : (
          <ProductGrid products={resolved} columns={4} />
        )}
      </div>
    </div>
  );
}
