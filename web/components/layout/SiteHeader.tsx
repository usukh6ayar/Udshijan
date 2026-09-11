"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/data/catalog";
import { useCart } from "@/lib/cart";
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

function CartCount() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white tabular-nums">
      {count}
    </span>
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

        <form
          action="/hailt"
          role="search"
          className="relative hidden min-w-0 flex-1 lg:block"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-2" />
          <input
            name="q"
            placeholder="Бараа, брэнд хайх…"
            aria-label="Бараа, брэнд хайх"
            className="h-11 w-full rounded-input border border-line bg-white pr-3 pl-10 text-body placeholder:text-ink-2 focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 lg:gap-4">
          <Link
            href="/huslin-jagsaalt"
            className="hidden flex-col items-center gap-1 px-2 text-caption text-ink-2 hover:text-ink lg:flex"
          >
            <Heart className="size-5 text-ink" />
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
        <form action="/hailt" role="search" className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-2" />
          <input
            name="q"
            placeholder="Бараа хайх…"
            aria-label="Бараа хайх"
            className="h-11 w-full rounded-input border border-line bg-white pr-3 pl-10 text-body placeholder:text-ink-2 focus:border-brand focus:ring-2 focus:ring-brand/25 focus:outline-none"
          />
        </form>
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

export function CategoryNav() {
  const pathname = usePathname();

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
