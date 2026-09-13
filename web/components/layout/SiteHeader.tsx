"use client";

import Link from "next/link";
import Form from "next/form";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Suspense, useState } from "react";
import { categories } from "@/lib/data/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cx } from "@/lib/format";

export function TopBar({ className }: { className?: string }) {
  return (
    <div className={cx("bg-ink text-white", className)}>
      <div className="container-uds flex h-10 items-center justify-between gap-4 text-small">
        <p className="truncate">
          24–48 цагийн хүргэлт
          <span className="mx-3 hidden text-white/30 sm:inline">·</span>
          <span className="hidden sm:inline">
            100,000₮-с дээш худалдан авалтад хүргэлт үнэгүй
          </span>
        </p>
        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <Link href="/tuslamj" className="hover:underline">
            Тусламж
          </Link>
          <Link href="/holboo-barih" className="hover:underline">
            Холбоо барих
          </Link>
          <span aria-hidden className="text-white/25">
            |
          </span>
          <span className="font-bold">МН</span>
        </div>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="shrink-0 leading-none">
      <span className="block text-[22px] font-extrabold tracking-[0.14em] text-ink">
        UDSHIJAN
      </span>
      <span className="mt-1 hidden text-[9px] tracking-[0.42em] text-ink-2 sm:block">
        ОНЛАЙН ДЭЛГҮҮР
      </span>
    </Link>
  );
}

function Count({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white tabular-nums">
      {value}
    </span>
  );
}

function CartCount() {
  const { count } = useCart();
  return <Count value={count} />;
}

function WishCount() {
  const { count } = useWishlist();
  return <Count value={count} />;
}

/**
 * Хайлтын форм. `next/form` нь GET хэлбэрээ хадгалж (JS-гүй үед ч ажиллана),
 * илгээхэд бүтэн дахин ачаалахын оронд client-side шилжилт хийнэ.
 * `prefetch={false}` — форм нь хуудас бүр дээр байдаг тул `/hailt`-ын landing-ийг
 * урьдчилж татах нь илүүдэл ачаалал.
 */
function SearchForm({
  className,
  placeholder,
}: {
  className?: string;
  placeholder: string;
}) {
  return (
    <Form action="/hailt" prefetch={false} role="search" className={className}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-2" />
      {/* Толгой нь статик хуудсуудад ч ордог тул useSearchParams-ыг Suspense-д хийнэ */}
      <Suspense fallback={<SearchInput placeholder={placeholder} q="" />}>
        <PrefilledSearchInput placeholder={placeholder} />
      </Suspense>
    </Form>
  );
}

function PrefilledSearchInput({ placeholder }: { placeholder: string }) {
  const q = useSearchParams().get("q") ?? "";
  return <SearchInput placeholder={placeholder} q={q} />;
}

function SearchInput({ placeholder, q }: { placeholder: string; q: string }) {
  return (
    <input
      key={q}
      name="q"
      defaultValue={q}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-11 w-full rounded-input border border-line bg-white pr-3 pl-10 text-body placeholder:text-ink-2 focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
    />
  );
}

export function SiteHeader({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cx("sticky top-0 z-40 border-b border-line bg-white", className)}
    >
      <div className="container-uds flex h-16 items-center gap-3 lg:h-20 lg:gap-5">
        <button
          type="button"
          aria-label="Цэс нээх"
          onClick={() => setMenuOpen((v) => !v)}
          className="-ml-2 flex size-10 items-center justify-center rounded-btn text-ink hover:bg-surface lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Wordmark />

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="hidden h-11 items-center gap-2 rounded-btn border border-line px-4 text-btn hover:bg-surface lg:inline-flex"
        >
          <Menu className="size-4" />
          Ангилал
        </button>

        <SearchForm
          className="relative hidden min-w-0 flex-1 lg:block"
          placeholder="Бараа, брэнд хайх…"
        />

        <div className="ml-auto flex items-center gap-1 lg:gap-4">
          <Link
            href="/huslin-jagsaalt"
            className="hidden flex-col items-center gap-1 px-2 text-caption text-ink-2 hover:text-ink lg:flex"
          >
            <span className="relative">
              <Heart className="size-5 text-ink" />
              <WishCount />
            </span>
            Хүслийн
          </Link>

          <Link
            href="/cart"
            aria-label="Сагс"
            className="flex flex-col items-center gap-1 px-2 text-caption text-ink-2 hover:text-ink"
          >
            <span className="relative">
              <ShoppingCart className="size-5 text-ink" />
              <CartCount />
            </span>
            <span className="hidden lg:block">Сагс</span>
          </Link>

          <Link
            href="/burtgel"
            className="hidden h-11 items-center gap-2 rounded-btn border border-line px-4 text-btn hover:bg-surface lg:inline-flex"
          >
            <User className="size-4" />
            Миний бүртгэл
          </Link>
        </div>
      </div>

      {/* Мобайлын хайлт */}
      <div className="container-uds pb-3 lg:hidden">
        <SearchForm className="relative" placeholder="Бараа хайх…" />
      </div>

      {menuOpen && <MegaMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-t border-line bg-white shadow-md">
      <div className="container-uds grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((c) => (
          <div key={c.slug}>
            <Link
              href={`/c/${c.slug}`}
              onClick={onClose}
              className="text-h3 hover:text-brand"
            >
              {c.name}
            </Link>
            <ul className="mt-2 space-y-1.5">
              {c.subcategories.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/c/${c.slug}?sub=${s.slug}`}
                    onClick={onClose}
                    className="text-body text-ink-2 hover:text-brand"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Ангиллын мөр. `usePathname`-ыг Suspense-ийн дотор уншина — динамик param-тай
 * замын статик бүрхүүл (ж: `/p/[slug]`) дээр pathname мэдэгдээгүй байдаг тул
 * эс бөгөөс бүх бүрхүүл хоосорно. Fallback нь идэвхтэй холбоосгүй ижил мөр.
 */
export function CategoryNav() {
  return (
    <Suspense fallback={<CategoryNavBar pathname="" />}>
      <ActiveCategoryNav />
    </Suspense>
  );
}

function ActiveCategoryNav() {
  return <CategoryNavBar pathname={usePathname()} />;
}

function CategoryNavBar({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden border-b border-line bg-white lg:block">
      <div className="container-uds flex h-12 items-center justify-between">
        <ul className="flex items-center gap-7">
          {categories
            .filter((c) => c.inNav)
            .map((c) => {
              const active = pathname === `/c/${c.slug}`;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/c/${c.slug}`}
                    className={cx(
                      "text-body transition-colors hover:text-brand",
                      active ? "font-bold text-brand" : "text-ink",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
        </ul>
        <div className="flex items-center gap-6">
          <Link
            href="/booniy-hudaldaa"
            className="inline-flex items-center gap-2 text-body font-bold text-brand hover:underline"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Бөөний худалдаа
          </Link>
          <Link
            href="/c/huvtsas?hyamdral=1"
            className="text-body font-bold text-danger hover:underline"
          >
            Хямдрал
          </Link>
        </div>
      </div>
    </nav>
  );
}
