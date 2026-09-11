import Link from "next/link";
import { BadgeCheck, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Placeholder } from "@/components/Placeholder";
import { Shell } from "@/components/layout/Shell";
import { ButtonLink } from "@/components/ui/Button";
import { ProductGrid } from "@/components/shop/ProductCard";
import { Section, SectionHeader } from "@/components/shop/Section";
import { categories } from "@/lib/data/catalog";
import { productsByFeature } from "@/lib/data/products";
import { num } from "@/lib/format";

export default function HomePage() {
  const bestsellers = productsByFeature("bestseller");
  const newArrivals = productsByFeature("new");

  return (
    <Shell>
      <Hero />

      <Section>
        <SectionHeader
          title="Ангилалаар худалдан авах"
          linkLabel="Бүх ангилал"
          linkHref="/c/huvtsas"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="rounded-card border border-line bg-white p-3 transition-shadow hover:shadow-md lg:p-4"
            >
              <Placeholder label={c.imageLabel} ratio="1/1" className="rounded-[6px]" />
              <h3 className="mt-3 text-h3">{c.name}</h3>
              <p className="mt-0.5 text-small text-ink-2">
                {num(c.productCount)} бараа
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Их борлуулалттай бараа"
          subtitle="Сүүлийн 30 хоногийн борлуулалтаар"
          linkLabel="Бүгдийг харах"
          linkHref="/c/huvtsas"
          arrows
        />
        <ProductGrid products={bestsellers} />
      </Section>

      <Section>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <PromoBanner
            eyebrow="ЦАХИЛГААН БАРАА"
            title={"Гэр ахуйн техник\n30% хүртэл хямдрал"}
            note="8 дугаар сарын 20-ныг хүртэл"
            cta="Хямдралыг харах"
            href="/c/tsahilgaan"
            imageLabel="техник"
            dark
          />
          <PromoBanner
            eyebrow="БӨӨНИЙ ХУДАЛДАА"
            title={"Бөөний үнээр\nхудалдан аваарай"}
            note="Илүү их хэмжээгээр, илүү ашигтай үнээр."
            cta="Бөөний эрх хүсэх"
            href="/booniy-hudaldaa"
            imageLabel="бөөний бараа"
          />
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="Шинээр нэмэгдсэн"
          linkLabel="Бүгдийг харах"
          linkHref="/c/huvtsas"
          arrows
        />
        <ProductGrid products={newArrivals} />
      </Section>

      <TrustStrip />
    </Shell>
  );
}

function Hero() {
  return (
    <section className="container-uds mt-4 lg:mt-6">
      <div className="grid overflow-hidden rounded-card bg-surface lg:grid-cols-[1fr_minmax(0,47%)]">
        <div className="order-2 p-6 lg:order-1 lg:p-12">
          <span className="inline-flex items-center rounded-btn bg-brand-tint px-3 py-1.5 text-small font-bold text-brand">
            Наймдугаар сарын хямдрал · 8 хоног
          </span>

          <h1 className="mt-5 text-h1 lg:text-display">
            Өдөр тутмын хэрэгцээт
            <br />
            бүхнийг нэг дороос
          </h1>

          <p className="mt-4 max-w-md text-body text-ink-2">
            Чанартай бүтээгдэхүүн, найдвартай хүргэлт. 10,000-с дээш нэр төрлийн
            бараа, Улаанбаатар хотод 24–48 цагийн дотор.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink
              href="/c/huvtsas"
              size="lg"
              className="w-full sm:w-auto"
            >
              Худалдан авалт хийх
            </ButtonLink>
            {/* Дизайны мобайл дэлгэцэнд хоёр дахь товч байхгүй */}
            <span className="hidden sm:contents">
              <ButtonLink
                href="/c/huvtsas?hyamdral=1"
                variant="secondary"
                size="lg"
              >
                Хямдралтай бараа
              </ButtonLink>
            </span>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6 lg:gap-x-10">
            {[
              ["10,000+", "нэр төрөл"],
              ["24–48 цаг", "хүргэлт"],
              ["4.8 / 5", "хэрэглэгчийн үнэлгээ"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-h2">{value}</dt>
                <dd className="mt-0.5 text-small text-ink-2">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="order-1 lg:order-2">
          <Placeholder
            label="кампанийн"
            size={[1100, 840]}
            className="h-full min-h-52 w-full"
          />
        </div>
      </div>
    </section>
  );
}

function PromoBanner({
  eyebrow,
  title,
  note,
  cta,
  href,
  imageLabel,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  note: string;
  cta: string;
  href: string;
  imageLabel: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-card ${
        dark ? "bg-ink text-white" : "bg-brand-tint text-ink"
      }`}
    >
      <div className="absolute inset-y-0 right-0 hidden w-2/5 sm:block">
        <Placeholder
          label={imageLabel}
          tone={dark ? "dark" : "tint"}
          className="h-full w-full"
        />
      </div>

      <div className="relative max-w-md p-6 lg:p-8">
        <p
          className={`text-caption font-bold tracking-[0.12em] ${
            dark ? "text-white/50" : "text-brand"
          }`}
        >
          {eyebrow}
        </p>
        <h3 className="mt-3 text-h2 whitespace-pre-line">{title}</h3>
        <p className={`mt-2 text-body ${dark ? "text-white/70" : "text-ink-2"}`}>
          {note}
        </p>
        <Link
          href={href}
          className={`mt-6 inline-flex h-11 items-center gap-2 rounded-btn px-4 text-btn ${
            dark ? "bg-white text-ink hover:bg-white/90" : "bg-brand text-white hover:bg-brand-hover"
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

const TRUST = [
  {
    icon: Truck,
    title: "24–48 цагийн хүргэлт",
    text: "Улаанбаатар хотод хурдан хүргэлт",
  },
  {
    icon: ShieldCheck,
    title: "Найдвартай төлбөр",
    text: "QPay, карт, банкны шилжүүлэг",
  },
  {
    icon: BadgeCheck,
    title: "Баталгаатай бүтээгдэхүүн",
    text: "14 хоногийн дотор буцаах боломжтой",
  },
  {
    icon: Headphones,
    title: "Хэрэглэгчийн дэмжлэг",
    text: "7700-1234 · 09:00–20:00",
  },
];

function TrustStrip() {
  return (
    <section className="container-uds mt-12 lg:mt-16">
      <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white p-5 lg:p-6">
            <Icon className="size-6 text-brand" />
            <h3 className="mt-3 text-h3">{title}</h3>
            <p className="mt-1 text-small text-ink-2">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
