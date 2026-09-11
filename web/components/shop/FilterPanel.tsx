"use client";

import { useState } from "react";
import {
  COLORS,
  HIDDEN_BRAND_COUNT,
  SIZES,
  brands,
  categories,
  categoryBySlug,
} from "@/lib/data/catalog";
import type { Category } from "@/lib/data/types";
import type { FilterState } from "@/lib/filters";
import { Input, SizeOption, Swatch, Toggle } from "@/components/ui/Field";
import { cx, num } from "@/lib/format";

type Patch = Partial<FilterState>;

export function FilterPanel({
  category,
  filters,
  onChange,
  idPrefix = "f",
}: {
  /**
   * Ангилалын хуудсанд тухайн ангилал дамжина → дэд ангилалаар шүүнэ.
   * Хайлтын хуудсанд байхгүй → эхлээд ангилал сонгож, дараа нь дэд ангилал нээгдэнэ.
   */
  category?: Category;
  filters: FilterState;
  onChange: (patch: Patch) => void;
  /** Sidebar болон bottom sheet хоёулаа зэрэг DOM-д байх тул id давхцахаас сэргийлнэ */
  idPrefix?: string;
}) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 3);

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Хайлтын хуудсанд сонгосон ангилал байвал түүний дэд ангилалыг харуулна
  const subSource = category ?? (filters.cat ? categoryBySlug(filters.cat) : undefined);

  return (
    <div className="divide-y divide-line">
      <Group title="Ангилал">
        {!category && (
          <ul className="mb-3 space-y-2">
            {categories.map((c) => {
              const active = filters.cat === c.slug;
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        cat: active ? null : c.slug,
                        // Ангилал солигдоход өмнөх дэд ангилал утгагүй болно
                        sub: null,
                        page: 1,
                      })
                    }
                    className={cx(
                      "text-left text-body transition-colors hover:text-brand",
                      active ? "font-bold text-brand" : "text-ink",
                    )}
                  >
                    {c.name}{" "}
                    <span className={active ? "text-brand" : "text-ink-2"}>
                      ({num(c.productCount)})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {subSource && (
          <ul className={cx("space-y-2", !category && "border-t border-line pt-3")}>
            {subSource.subcategories.map((s) => {
              const active = filters.sub === s.slug;
              return (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => onChange({ sub: active ? null : s.slug, page: 1 })}
                    className={cx(
                      "text-left text-body transition-colors hover:text-brand",
                      active ? "font-bold text-brand" : "text-ink",
                    )}
                  >
                    {s.name}{" "}
                    <span className={active ? "text-brand" : "text-ink-2"}>
                      ({num(s.count)})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Group>

      <Group title="Үнэ">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Хамгийн бага үнэ"
            placeholder="0₮"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onChange({
                priceMin: e.target.value === "" ? null : Number(e.target.value),
                page: 1,
              })
            }
          />
          <span aria-hidden className="text-ink-2">
            —
          </span>
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Хамгийн их үнэ"
            placeholder="500,000₮"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onChange({
                priceMax: e.target.value === "" ? null : Number(e.target.value),
                page: 1,
              })
            }
          />
        </div>
        <input
          type="range"
          aria-label="Дээд үнэ"
          min={0}
          max={300000}
          step={5000}
          value={filters.priceMax ?? 300000}
          onChange={(e) => onChange({ priceMax: Number(e.target.value), page: 1 })}
          className="mt-4 w-full accent-brand"
        />
      </Group>

      <Group title="Брэнд">
        <ul className="space-y-2.5">
          {visibleBrands.map((b) => {
            const id = `${idPrefix}-brand-${b.slug}`;
            return (
              <li key={b.slug} className="flex items-center gap-2.5">
                <input
                  id={id}
                  type="checkbox"
                  checked={filters.brands.includes(b.name)}
                  onChange={() =>
                    onChange({ brands: toggleIn(filters.brands, b.name), page: 1 })
                  }
                  className="size-4 shrink-0 rounded-[4px] border-line accent-brand"
                />
                <label htmlFor={id} className="flex-1 text-body">
                  {b.name}{" "}
                  <span className="text-ink-2">({num(b.count)})</span>
                </label>
              </li>
            );
          })}
        </ul>
        {!showAllBrands && (
          <button
            type="button"
            onClick={() => setShowAllBrands(true)}
            className="mt-3 text-small font-bold text-brand hover:underline"
          >
            + {HIDDEN_BRAND_COUNT} брэнд харах
          </button>
        )}
      </Group>

      <Group title="Өнгө">
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <Swatch
              key={c.name}
              hex={c.hex}
              name={c.name}
              selected={filters.colors.includes(c.name)}
              onClick={() =>
                onChange({ colors: toggleIn(filters.colors, c.name), page: 1 })
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Размер">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <SizeOption
              key={s}
              label={s}
              compact
              selected={filters.sizes.includes(s)}
              onClick={() =>
                onChange({ sizes: toggleIn(filters.sizes, s), page: 1 })
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Бусад">
        <div className="space-y-3">
          <Toggle
            id={`${idPrefix}-instock`}
            label="Үлдэгдэлтэй"
            checked={filters.inStock}
            onChange={(v) => onChange({ inStock: v, page: 1 })}
          />
          <Toggle
            id={`${idPrefix}-sale`}
            label="Хямдралтай"
            checked={filters.sale}
            onChange={(v) => onChange({ sale: v, page: 1 })}
          />
          <Toggle
            id={`${idPrefix}-wholesale`}
            label="Бөөний үнэтэй"
            checked={filters.wholesale}
            onChange={(v) => onChange({ wholesale: v, page: 1 })}
          />
        </div>
      </Group>

      <Group title="Үнэлгээ">
        <ul className="space-y-2.5">
          {[4, 3].map((r) => {
            const id = `${idPrefix}-rating-${r}`;
            return (
              <li key={r} className="flex items-center gap-2.5">
                <input
                  id={id}
                  type="radio"
                  name={`${idPrefix}-rating`}
                  checked={filters.rating === r}
                  onChange={() => onChange({ rating: r, page: 1 })}
                  className="size-4 shrink-0 accent-brand"
                />
                <label htmlFor={id} className="flex items-center gap-1.5 text-body">
                  <span aria-hidden className="text-rating">
                    {"★".repeat(r)}
                  </span>
                  -с дээш
                </label>
              </li>
            );
          })}
          {filters.rating !== null && (
            <li>
              <button
                type="button"
                onClick={() => onChange({ rating: null, page: 1 })}
                className="text-small text-ink-2 hover:text-brand"
              >
                Үнэлгээний шүүлтүүр арилгах
              </button>
            </li>
          )}
        </ul>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-5 first:pt-4">
      <h3 className="mb-3 text-h3">{title}</h3>
      {children}
    </div>
  );
}
