import Link from "next/link";
import { ChevronLeft, Heart, Search, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import { CategoryNav, SiteHeader, TopBar } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { MobileTabBar } from "./MobileTabBar";

type ShellProps = {
  children: ReactNode;
  /**
   * Мобайл дээр үндсэн толгойн оронд «← Гарчиг» мөр харуулна (1f — ангилал, бүтээгдэхүүн).
   * Дизайны 1f дэлгэц дээр эдгээр хуудсууд өөр толгойтой.
   *
   * ReactNode: PDP дээр гарчиг нь runtime param-аас хамаардаг тул `<Suspense>`
   * ороосон компонент дамжуулах боломжтой байх ёстой.
   */
  mobileTitle?: ReactNode;
  /** Мобайл дээр баруун талд юу харуулах */
  mobileActions?: "search" | "cart";
  /** Доод sticky bar-т зай гаргах (PDP) */
  bottomBarSpace?: boolean;
};

export function Shell({
  children,
  mobileTitle,
  mobileActions = "search",
  bottomBarSpace,
}: ShellProps) {
  const desktopOnly = mobileTitle ? "hidden lg:block" : undefined;

  return (
    <>
      {mobileTitle && (
        <MobileSubHeader title={mobileTitle} actions={mobileActions} />
      )}
      <TopBar className={desktopOnly} />
      <SiteHeader className={desktopOnly} />
      <CategoryNav />

      <main className="flex-1">{children}</main>

      <SiteFooter />

      {/* Доод таб бар (+ PDP-ийн sticky bar)-ын зай */}
      <div
        className={bottomBarSpace ? "h-36 lg:hidden" : "h-16 lg:hidden"}
        aria-hidden
      />
      <MobileTabBar />
    </>
  );
}

function MobileSubHeader({
  title,
  actions,
}: {
  title: ReactNode;
  actions: "search" | "cart";
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white lg:hidden">
      <div className="container-uds flex h-14 items-center gap-2">
        <Link
          href="/"
          aria-label="Буцах"
          className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-btn hover:bg-surface"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h2 className="min-w-0 flex-1 truncate text-h3">{title}</h2>
        {actions === "search" ? (
          <Link
            href="/hailt"
            aria-label="Хайх"
            className="flex size-10 items-center justify-center rounded-btn hover:bg-surface"
          >
            <Search className="size-5" />
          </Link>
        ) : (
          <>
            <Link
              href="/huslin-jagsaalt"
              aria-label="Хүслийн жагсаалт"
              className="flex size-10 items-center justify-center rounded-btn hover:bg-surface"
            >
              <Heart className="size-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="Сагс"
              className="-mr-2 flex size-10 items-center justify-center rounded-btn hover:bg-surface"
            >
              <ShoppingCart className="size-5" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
