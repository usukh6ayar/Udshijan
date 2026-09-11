import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Headphones,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Shell } from "@/components/layout/Shell";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { generalFaqs, helpArticles } from "@/lib/data/help";

export const metadata: Metadata = {
  title: "Тусламжийн төв",
  description:
    "Захиалга хянах, хүргэлт, буцаалт, төлбөр, баталгаат хугацааны талаарх бүх мэдээлэл.",
};

/** Нийтлэл бүрийн айкон — өгөгдлийн файлд React байхгүй тул энд тааруулна */
const ICONS: Record<string, typeof Package> = {
  zahialga: Package,
  butsaalt: RotateCcw,
  hurgelt: Truck,
  tolbor: CreditCard,
  batalgaa: BadgeCheck,
};

export default function HelpPage() {
  return (
    <Shell mobileTitle="Тусламж" mobileActions="cart">
      <div className="container-uds pb-10">
        <div className="hidden lg:block">
          <Breadcrumb items={[{ label: "Нүүр", href: "/" }, { label: "Тусламж" }]} />
        </div>

        <div className="pt-4 lg:pt-2">
          <h1 className="hidden text-h1 lg:block">Тусламжийн төв</h1>
          <p className="max-w-2xl text-body text-ink-2 lg:mt-2">
            Захиалга, хүргэлт, буцаалт, төлбөрийн талаарх түгээмэл асуултуудын
            хариуг эндээс аваарай.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {helpArticles.map((article) => {
            const Icon = ICONS[article.slug] ?? Package;
            return (
              <Link
                key={article.slug}
                href={`/tuslamj/${article.slug}`}
                className="group flex flex-col rounded-card border border-line bg-white p-5 transition-shadow hover:shadow-md"
              >
                <Icon className="size-6 text-brand" />
                <h2 className="mt-3 text-h3 group-hover:text-brand">
                  {article.title}
                </h2>
                <p className="mt-1.5 text-small text-ink-2">{article.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {article.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-[6px] bg-surface px-2 py-1 text-caption tracking-normal text-ink-2"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1.5 text-small font-bold text-brand">
                  Дэлгэрэнгүй
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 lg:mt-16">
          <h2 className="text-h2">Түгээмэл асуултууд</h2>
          <Accordion items={generalFaqs} className="mt-5" />
        </section>

        <section className="mt-10 grid gap-5 rounded-card bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center lg:p-8">
          <div className="flex gap-4">
            <Headphones className="mt-1 size-6 shrink-0 text-brand" />
            <div>
              <h2 className="text-h3">Хариултаа олсонгүй юу?</h2>
              <p className="mt-1 text-body text-ink-2">
                7700-1234 · Даваа–Ням, 09:00–20:00 · info@udshijan.mn
              </p>
            </div>
          </div>
          <ButtonLink href="/holboo-barih" size="lg">
            Холбоо барих
          </ButtonLink>
        </section>
      </div>
    </Shell>
  );
}
