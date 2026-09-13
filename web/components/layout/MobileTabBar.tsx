"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Heart, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { cx } from "@/lib/format";

const TABS = [
  { href: "/", label: "Нүүр", icon: ShoppingBag },
  { href: "/c/huvtsas", label: "Ангилал", icon: LayoutGrid },
  { href: "/hailt", label: "Хайх", icon: Search },
  { href: "/huslin-jagsaalt", label: "Хүслийн", icon: Heart },
  { href: "/burtgel", label: "Бүртгэл", icon: User },
];

/**
 * 1f — мобайлын доод таб бар.
 *
 * `usePathname` нь динамик param-тай замын статик бүрхүүлийг prerender хийх үед
 * suspend болдог (`/p/[slug]`). Тиймээс уншилтыг Suspense-ийн дотор хийж,
 * fallback дээр идэвхтэй таб нь тодроогүй ижил бар-ыг гаргана — ингэснээр
 * бүрхүүл бүрэн үлдэнэ. SiteHeader-ийн `useSearchParams` хэв маягтай ижил.
 */
export function MobileTabBar() {
  return (
    <Suspense fallback={<TabBar pathname="" />}>
      <ActiveTabBar />
    </Suspense>
  );
}

function ActiveTabBar() {
  return <TabBar pathname={usePathname()} />;
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Үндсэн цэс"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex flex-col items-center gap-1 py-2 text-caption tracking-normal",
                  active ? "text-ink" : "text-ink-2",
                )}
              >
                <Icon className={cx("size-5", active && "stroke-[2.4]")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
