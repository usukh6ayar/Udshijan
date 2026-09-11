import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { CategoryView } from "@/components/shop/CategoryView";
import { categories, categoryBySlug } from "@/lib/data/catalog";

const SECTIONS: Record<string, string> = {
  eregtei: "Эрэгтэй",
  emegtei: "Эмэгтэй",
};

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/c/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = categoryBySlug(slug);
  return { title: category?.name ?? "Ангилал" };
}

export default async function CategoryPage(props: PageProps<"/c/[slug]">) {
  const { slug } = await props.params;
  const search = await props.searchParams;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const rawSection = search.section;
  const section = typeof rawSection === "string" && rawSection in SECTIONS
    ? rawSection
    : null;

  const title = section
    ? `${SECTIONS[section]} ${category.name.toLowerCase()}`
    : category.name;

  return (
    <Shell mobileTitle={title} mobileActions="search">
      <Suspense fallback={null}>
        <CategoryView category={category} section={section} title={title} />
      </Suspense>
    </Shell>
  );
}
