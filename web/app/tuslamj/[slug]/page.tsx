import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Headphones } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Shell } from "@/components/layout/Shell";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { OrderLookup } from "@/components/shop/OrderLookup";
import { helpArticles, helpArticleBySlug } from "@/lib/data/help";
import { cx } from "@/lib/format";

export function generateStaticParams() {
  return helpArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  props: PageProps<"/tuslamj/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = helpArticleBySlug(slug);
  if (!article) return { title: "Тусламж" };
  return { title: article.title, description: article.summary };
}

export default async function HelpArticlePage(
  props: PageProps<"/tuslamj/[slug]">,
) {
  const { slug } = await props.params;
  const article = helpArticleBySlug(slug);
  if (!article) notFound();

  return (
    <Shell mobileTitle={article.title} mobileActions="cart">
      <div className="container-uds pb-10">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { label: "Нүүр", href: "/" },
              { label: "Тусламж", href: "/tuslamj" },
              { label: article.title },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-8 lg:mt-2 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <article>
            <h1 className="hidden text-h1 lg:block">{article.title}</h1>
            <p className="text-body text-ink-2 lg:mt-2">{article.summary}</p>

            {article.slug === "zahialga" && <OrderLookup />}

            <div className="mt-8 space-y-8">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-h2">{section.heading}</h2>

                  {section.body?.map((p) => (
                    <p key={p} className="mt-3 text-body text-ink-2">
                      {p}
                    </p>
                  ))}

                  {section.list && (
                    <ul className="mt-4 space-y-2.5">
                      {section.list.map((item, i) => (
                        <li key={item} className="flex gap-3 text-body text-ink-2">
                          <span
                            aria-hidden
                            className={cx(
                              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-caption font-bold",
                              section.ordered
                                ? "bg-brand text-white"
                                : "bg-brand-tint text-brand",
                            )}
                          >
                            {section.ordered ? i + 1 : "·"}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {article.faqs && article.faqs.length > 0 && (
              <section className="mt-10">
                <h2 className="text-h2">Түгээмэл асуултууд</h2>
                <Accordion items={article.faqs} className="mt-5" />
              </section>
            )}

            <section className="mt-10 grid gap-5 rounded-card bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex gap-4">
                <Headphones className="mt-1 size-6 shrink-0 text-brand" />
                <div>
                  <h2 className="text-h3">Асуулт үлдсэн үү?</h2>
                  <p className="mt-1 text-body text-ink-2">
                    7700-1234 · Даваа–Ням, 09:00–20:00
                  </p>
                </div>
              </div>
              <ButtonLink href="/holboo-barih" size="lg">
                Холбоо барих
              </ButtonLink>
            </section>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-caption font-bold tracking-[0.12em] text-ink-2">
              БУСАД СЭДЭВ
            </h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
              {helpArticles.map((a) => {
                const active = a.slug === article.slug;
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/tuslamj/${a.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "flex items-center justify-between gap-3 px-4 py-3.5 text-body transition-colors",
                        active
                          ? "bg-brand-tint font-bold text-brand"
                          : "hover:bg-surface",
                      )}
                    >
                      {a.title}
                      {!active && (
                        <ArrowRight className="size-4 shrink-0 text-ink-2" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
