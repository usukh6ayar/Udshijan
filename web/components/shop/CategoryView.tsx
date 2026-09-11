"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { Sheet } from "@/components/ui/Sheet";
import { FilterPanel } from "./FilterPanel";
import { ProductCard } from "./ProductCard";
import { products as allProducts } from "@/lib/data/products";
import type { Category } from "@/lib/data/types";
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  PAGE_SIZE,
  parseFilters,
  serializeFilters,
  SORT_OPTIONS,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { cx, money, num } from "@/lib/format";

export function CategoryView({
  category,
  section,
  title,
}: {
  category: Category;
  section: string | null;
  title: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const push = useCallback(
    (next: FilterState) => {
      const sp = serializeFilters(next);
      if (section) sp.set("section", section);
      const qs = sp.toString();
      router.replace(qs ? `/c/${category.slug}?${qs}` : `/c/${category.slug}`, {
        scroll: false,
      });
    },
    [router, category.slug, section],
  );

  const update = useCallback(
    (patch: Partial<FilterState>) => push({ ...filters, ...patch }),
    [filters, push],
  );

  const clearAll = useCallback(() => push(EMPTY_FILTERS), [push]);

  const pool = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.category === category.slug && (!section || p.section === section),
      ),
    [category.slug, section],
  );

  const results = useMemo(() => applyFilters(pool, filters), [pool, filters]);
  const activeCount = activeFilterCount(filters);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  const chips = buildChips(filters, update);

  const hrefFor = (p: number) => {
    const sp = serializeFilters({ ...filters, page: p });
    if (section) sp.set("section", section);
    return `/c/${category.slug}?${sp.toString()}`;
  };

  return (
    <div className="container-uds pb-10">
      <div className="hidden lg:block">
        <Breadcrumb
          items={[
            { label: "Нүүр", href: "/" },
            { label: category.name, href: `/c/${category.slug}` },
            ...(section ? [{ label: title.replace(` ${category.name.toLowerCase()}`, "") }] : []),
          ]}
        />
      </div>

      {/* Гарчиг + эрэмбэ */}
      <div className="flex flex-col gap-4 pt-4 lg:flex-row lg:items-end lg:justify-between lg:pt-2">
        <div>
          <h1 className="hidden text-h1 lg:block">{title}</h1>
          <p className="text-small text-ink-2 lg:mt-1.5">
            {num(results.length)} бараа
            {activeCount > 0 && ` · ${activeCount} шүүлтүүр активтай`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Мобайл: Эрэмбэ + Шүүлтүүр товч */}
          <div className="flex flex-1 items-center gap-2 lg:hidden">
            <Select
              aria-label="Эрэмбэлэх"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey, page: 1 })}
              className="flex-1"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </Select>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cx(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-btn border px-3 text-btn",
                activeCount > 0
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-line bg-white text-ink",
              )}
            >
              <SlidersHorizontal className="size-4" />
              Шүүлтүүр
              {activeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Дэлгэц: эрэмбэ + grid/list */}
          <div className="hidden items-center gap-3 lg:flex">
            <label className="flex items-center gap-2 text-small text-ink-2">
              Эрэмбэлэх:
              <Select
                aria-label="Эрэмбэлэх"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey, page: 1 })}
                className="w-48"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex overflow-hidden rounded-btn border border-line">
              <ViewBtn
                active={view === "grid"}
                onClick={() => setView("grid")}
                label="Торон харагдац"
              >
                <LayoutGrid className="size-4" />
              </ViewBtn>
              <ViewBtn
                active={view === "list"}
                onClick={() => setView("list")}
                label="Жагсаалт харагдац"
              >
                <List className="size-4" />
              </ViewBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Идэвхтэй шүүлтүүрийн чипүүд */}
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="hidden text-small text-ink-2 lg:inline">
            Активтай шүүлтүүр:
          </span>
          {chips.map((c) => (
            <Chip key={c.key} onRemove={c.onRemove}>
              {c.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-small font-bold text-brand underline underline-offset-2 hover:no-underline"
          >
            Бүгдийг цэвэрлэх
          </button>
        </div>
      )}

      <div className="mt-5 flex gap-6 lg:mt-6">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-card border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-h3">Шүүлтүүр</h2>
              {activeCount > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-brand text-caption font-bold text-white">
                  {activeCount}
                </span>
              )}
            </div>
            <FilterPanel
              category={category}
              filters={filters}
              onChange={update}
              idPrefix="side"
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {pageItems.length === 0 ? (
            <div className="rounded-card border border-line bg-white">
              <EmptyState
                icon={<SlidersHorizontal className="size-6" />}
                title="Илэрц олдсонгүй"
                description="Сонгосон шүүлтүүрт тохирох бараа алга байна. Шүүлтүүрээ өөрчилж үзнэ үү."
              />
              <div className="flex justify-center pb-8">
                <Button variant="secondary" onClick={clearAll}>
                  Шүүлтүүр цэвэрлэх
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cx(
                view === "list"
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5",
              )}
            >
              {pageItems.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 lg:flex-row">
              <p className="text-small text-ink-2">
                {num(results.length)} бараанаас {start + 1}–
                {start + pageItems.length} харагдаж байна
              </p>
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
              )}
            </div>
          )}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Шүүлтүүр"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={clearAll} className="flex-1">
              Цэвэрлэх
            </Button>
            <Button onClick={() => setSheetOpen(false)} className="flex-[2]">
              {num(results.length)} бараа харах
            </Button>
          </div>
        }
      >
        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <Chip key={c.key} onRemove={c.onRemove}>
                {c.label}
              </Chip>
            ))}
          </div>
        )}
        <FilterPanel
          category={category}
          filters={filters}
          onChange={update}
          idPrefix="sheet"
        />
      </Sheet>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cx(
        "flex size-11 items-center justify-center transition-colors",
        active ? "bg-ink text-white" : "bg-white text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

type ChipDef = { key: string; label: string; onRemove: () => void };

function buildChips(
  f: FilterState,
  update: (patch: Partial<FilterState>) => void,
): ChipDef[] {
  const chips: ChipDef[] = [];

  for (const c of f.colors) {
    chips.push({
      key: `ongo-${c}`,
      label: c,
      onRemove: () =>
        update({ colors: f.colors.filter((v) => v !== c), page: 1 }),
    });
  }
  for (const s of f.sizes) {
    chips.push({
      key: `razmer-${s}`,
      label: s,
      onRemove: () => update({ sizes: f.sizes.filter((v) => v !== s), page: 1 }),
    });
  }
  for (const b of f.brands) {
    chips.push({
      key: `brand-${b}`,
      label: b,
      onRemove: () =>
        update({ brands: f.brands.filter((v) => v !== b), page: 1 }),
    });
  }
  if (f.priceMin !== null || f.priceMax !== null) {
    const label =
      f.priceMin !== null && f.priceMax !== null
        ? `${money(f.priceMin)} — ${money(f.priceMax)}`
        : f.priceMax !== null
          ? `${money(f.priceMax)} хүртэл`
          : `${money(f.priceMin!)}-с дээш`;
    chips.push({
      key: "une",
      label,
      onRemove: () => update({ priceMin: null, priceMax: null, page: 1 }),
    });
  }
  if (f.inStock) {
    chips.push({
      key: "uldegdel",
      label: "Үлдэгдэлтэй",
      onRemove: () => update({ inStock: false, page: 1 }),
    });
  }
  if (f.sale) {
    chips.push({
      key: "hyamdral",
      label: "Хямдралтай",
      onRemove: () => update({ sale: false, page: 1 }),
    });
  }
  if (f.wholesale) {
    chips.push({
      key: "boon",
      label: "Бөөний үнэтэй",
      onRemove: () => update({ wholesale: false, page: 1 }),
    });
  }
  if (f.rating !== null) {
    chips.push({
      key: "unelgee",
      label: `${"★".repeat(f.rating)}-с дээш`,
      onRemove: () => update({ rating: null, page: 1 }),
    });
  }

  return chips;
}
