import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductGrid } from "@/components/shop/ProductCard";
import { SectionHeader } from "@/components/shop/Section";
import { categoryBySlug } from "@/lib/data/catalog";
import { products, productBySlug, relatedProducts } from "@/lib/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/p/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = productBySlug(slug);
  if (!product) return { title: "Бүтээгдэхүүн" };
  return { title: product.titleFull ?? product.title, description: product.description };
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const category = categoryBySlug(product.category);
  const related = relatedProducts(product);

  return (
    <Shell
      mobileTitle={category?.name ?? "Бүтээгдэхүүн"}
      mobileActions="cart"
      bottomBarSpace
    >
      <ProductDetail
        product={product}
        categoryName={category?.name ?? ""}
        categorySlug={product.category}
      />

      <section className="container-uds mt-12 lg:mt-16">
        <SectionHeader title="Ижил төрлийн бараа" />
        <ProductGrid products={related} />
      </section>
    </Shell>
  );
}
