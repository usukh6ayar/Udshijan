import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Shell } from "@/components/layout/Shell";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductDetailSkeleton } from "@/components/shop/ProductDetailSkeleton";
import { ProductGrid } from "@/components/shop/ProductCard";
import { SectionHeader } from "@/components/shop/Section";
import { categoryBySlug } from "@/lib/data/catalog";
import {
  allProductSlugs,
  productBySlug,
  relatedProducts,
} from "@/lib/data/products";

/**
 * Бүх 17 slug-ийг буцаана — build дээр бүгд prerender хийгдэнэ. Жагсаалтад
 * ороогүй slug (админ шинээр үүсгэсэн бараа) ч ажиллана: түүнд статик бүрхүүл
 * үзүүлээд агуулгыг нь хүсэлтийн үед урсгана.
 */
export async function generateStaticParams() {
  const slugs = await allProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/p/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await productBySlug(slug);
  if (!product) return { title: "Бүтээгдэхүүн" };
  return { title: product.titleFull ?? product.title, description: product.description };
}

/**
 * Хуудас нь `params`-ыг ДЭЭД түвшинд await хийхгүй: тэгвэл мэдэгдээгүй slug-ийн
 * статик бүрхүүл хоосон болно. Оронд нь promise-ыг `<Suspense>`-ийн доторх
 * компонентууд руу дамжуулна (migrating-to-cache-components: «Await `params`
 * inside `<Suspense>`»).
 */
export default function ProductPage(props: PageProps<"/p/[slug]">) {
  return (
    <Shell
      mobileTitle={
        <Suspense fallback="Бүтээгдэхүүн">
          <ProductCategoryName params={props.params} />
        </Suspense>
      }
      mobileActions="cart"
      bottomBarSpace
    >
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductContent params={props.params} />
      </Suspense>
    </Shell>
  );
}

/** Мобайл толгойн гарчиг — барааны ангиллын нэр */
async function ProductCategoryName({
  params,
}: Pick<PageProps<"/p/[slug]">, "params">) {
  const { slug } = await params;
  const product = await productBySlug(slug);
  return categoryBySlug(product?.category ?? "")?.name ?? "Бүтээгдэхүүн";
}

async function ProductContent({
  params,
}: Pick<PageProps<"/p/[slug]">, "params">) {
  const { slug } = await params;
  const product = await productBySlug(slug);
  if (!product) notFound();

  const category = categoryBySlug(product.category);
  const related = await relatedProducts(product);

  return (
    <>
      <ProductDetail
        product={product}
        categoryName={category?.name ?? ""}
        categorySlug={product.category}
      />

      <section className="container-uds mt-12 lg:mt-16">
        <SectionHeader title="Ижил төрлийн бараа" />
        <ProductGrid products={related} />
      </section>
    </>
  );
}
