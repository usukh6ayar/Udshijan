import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { CategoryView } from "@/components/shop/CategoryView";
import { categories, categoryBySlug } from "@/lib/data/catalog";
import { allProducts } from "@/lib/data/products";
import type { Category } from "@/lib/data/types";

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
  const category = categoryBySlug(slug);
  if (!category) notFound();

  /* `?section=` нь runtime өгөгдөл тул мобайл толгойн гарчгийг ч Suspense-ийн
     дотор тооцно. Fallback нь ангиллын энгийн нэр — section ирэнгүүт бүтэн
     нэр («Эрэгтэй хувцас») болж солигдоно, бүрхүүл статикаараа үлдэнэ. */
  return (
    <Shell
      mobileTitle={
        <Suspense fallback={category.name}>
          <CategoryTitle
            category={category}
            searchParams={props.searchParams}
          />
        </Suspense>
      }
      mobileActions="search"
    >
      <Suspense fallback={null}>
        <CategoryProducts
          category={category}
          searchParams={props.searchParams}
        />
      </Suspense>
    </Shell>
  );
}

type SearchParams = PageProps<"/c/[slug]">["searchParams"];

/** `?section=` утга зөвшөөрөгдсөн эсэх */
function sectionOf(search: Awaited<SearchParams>): string | null {
  const raw = search.section;
  return typeof raw === "string" && raw in SECTIONS ? raw : null;
}

function titleOf(category: Category, section: string | null): string {
  return section
    ? `${SECTIONS[section]} ${category.name.toLowerCase()}`
    : category.name;
}

/** Мобайл толгойн гарчиг — section-оор тодотгосон бүтэн нэр */
async function CategoryTitle({
  category,
  searchParams,
}: {
  category: Category;
  searchParams: SearchParams;
}) {
  return titleOf(category, sectionOf(await searchParams));
}

/**
 * `hailt/page.tsx`-тэй ижил хэв маяг: DB-ийн хүлээлт БА `searchParams`-ийн
 * уншилтыг Suspense-ийн ДОТОР байлгахын тулд тусдаа async компонент болгов.
 * Ингэснээр хуудасны бүрхүүл статикаар prerender хийгдэнэ.
 */
async function CategoryProducts({
  category,
  searchParams,
}: {
  category: Category;
  searchParams: SearchParams;
}) {
  const section = sectionOf(await searchParams);

  return (
    <CategoryView
      category={category}
      section={section}
      title={titleOf(category, section)}
      products={await allProducts()}
    />
  );
}
