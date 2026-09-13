import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck2,
  Headphones,
  Percent,
  Truck,
  Wallet,
} from "lucide-react";
import { Placeholder } from "@/components/Placeholder";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Shell } from "@/components/layout/Shell";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { WholesaleForm } from "@/components/shop/WholesaleForm";
import { allProducts } from "@/lib/data/products";
import { discountPercent, money, num } from "@/lib/format";

export const metadata: Metadata = {
  title: "Бөөний худалдаа",
  description:
    "10 ширхэгээс дээш захиалгад бөөний үнэ. Байгууллага, дэлгүүр эрхлэгчдэд зориулсан нөхцөл, өргөдлийн маягт.",
};

const BENEFITS = [
  {
    icon: Percent,
    title: "35% хүртэл хямд",
    text: "Тоо хэмжээ нэмэгдэх тусам нэгжийн үнэ буурна",
  },
  {
    icon: Truck,
    title: "Тээврийн дэмжлэг",
    text: "Улаанбаатар дотор үнэгүй, орон нутагт тээвэрт тушаана",
  },
  {
    icon: Wallet,
    title: "Уян хатан төлбөр",
    text: "30% урьдчилгаа, үлдэгдлийг хүргэлтийн дараа",
  },
  {
    icon: Headphones,
    title: "Хувийн менежер",
    text: "Захиалга, үлдэгдлийн мэдээллийг шууд авна",
  },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Өргөдөл илгээх",
    text: "Байгууллагын нэр, регистр, холбоо барих мэдээллээ бөглөнө.",
  },
  {
    icon: FileCheck2,
    title: "Баталгаажуулалт",
    text: "1–2 ажлын өдөрт шалгаж, гэрээний төслийг и-мэйлээр илгээнэ.",
  },
  {
    icon: Percent,
    title: "Бөөний үнэ идэвхжинэ",
    text: "Бүртгэлд тань орсны дараа сайт дээр бөөний үнэ шууд харагдана.",
  },
];

const FAQS = [
  {
    q: "Хамгийн бага захиалга хэд вэ?",
    a: "Ерөнхийдөө нэг нэр төрлөөс 10 ширхэг. Зарим бараанд өөр байх тул барааны хуудсан дахь бөөний үнийн хүснэгтээс шалгана уу.",
  },
  {
    q: "Хувь хүн бөөний эрх авч болох уу?",
    a: "Болно. Иргэний регистрийн дугаараа (АА12345678 хэлбэрээр) оруулж өргөдөл илгээнэ үү.",
  },
  {
    q: "Нэхэмжлэх, гэрээ гаргадаг уу?",
    a: "Тийм. Баталгаажсан харилцагчид НӨАТ-тай нэхэмжлэх, жилийн хамтын ажиллагааны гэрээ байгуулна.",
  },
  {
    q: "Бөөний бараа буцаадаг уу?",
    a: "Үйлдвэрийн гэмтэлтэй бараа 14 хоногийн дотор бүрэн солигдоно. Захиалгаар авсан барааг буцаах боломжгүй.",
  },
];

export default async function WholesalePage() {
  const wholesaleProducts = (await allProducts()).filter((p) => p.wholesale);

  return (
    <Shell mobileTitle="Бөөний худалдаа" mobileActions="cart">
      <div className="container-uds pb-10">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[{ label: "Нүүр", href: "/" }, { label: "Бөөний худалдаа" }]}
          />
        </div>

        {/* Hero */}
        <section className="mt-4 grid overflow-hidden rounded-card bg-brand-tint lg:mt-2 lg:grid-cols-[1fr_minmax(0,42%)]">
          <div className="order-2 p-6 lg:order-1 lg:p-10">
            <p className="text-caption font-bold tracking-[0.12em] text-brand">
              БӨӨНИЙ ХУДАЛДАА
            </p>
            <h1 className="mt-3 text-h1">
              Илүү их хэмжээгээр,
              <br />
              илүү ашигтай үнээр
            </h1>
            <p className="mt-4 max-w-md text-body text-ink-2">
              Дэлгүүр, байгууллага, дахин борлуулагчдад зориулсан бөөний үнэ.
              10 ширхэгээс эхлэн шатлалт хөнгөлөлт үйлчилнэ.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="#uroodol" size="lg">
                Бөөний эрх хүсэх
              </ButtonLink>
              <ButtonLink href="/c/huvtsas?boon=1" variant="secondary" size="lg">
                Бөөний үнэтэй бараа
              </ButtonLink>
            </div>
            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-brand/15 pt-6">
              {[
                ["10 ширхэг", "хамгийн бага захиалга"],
                ["35%", "хүртэл хөнгөлөлт"],
                ["1–2 хоног", "баталгаажуулалт"],
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
              label="бөөний бараа"
              tone="tint"
              size={[900, 760]}
              className="h-full min-h-52 w-full"
            />
          </div>
        </section>

        {/* Давуу тал */}
        <section className="mt-12 lg:mt-16">
          <h2 className="text-h2">Яагаад бөөнөөр авах вэ</h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white p-5 lg:p-6">
                <Icon className="size-6 text-brand" />
                <h3 className="mt-3 text-h3">{title}</h3>
                <p className="mt-1 text-small text-ink-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Үнийн шатлалын жишээ */}
        <section className="mt-12 lg:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-h2">Үнийн шатлалын жишээ</h2>
              <p className="mt-1 text-small text-ink-2">
                {num(wholesaleProducts.length)} бараанд бөөний үнэ идэвхтэй
              </p>
            </div>
            <Link
              href="/c/huvtsas?boon=1"
              className="hidden shrink-0 items-center gap-1.5 text-small font-bold text-brand hover:underline sm:inline-flex"
            >
              Бүгдийг харах
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2 lg:gap-5">
            {wholesaleProducts.slice(0, 4).map((p) => {
              const w = p.wholesale!;
              const best = w.tiers[w.tiers.length - 1];
              const off = discountPercent(best.price, p.price);

              return (
                <div
                  key={p.slug}
                  className="overflow-hidden rounded-card border border-line bg-white"
                >
                  <div className="flex items-start gap-4 border-b border-line p-4">
                    <Placeholder
                      label={p.imageLabel}
                      ratio="1/1"
                      bare
                      className="w-16 shrink-0 overflow-hidden rounded-[6px] border border-line"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-caption tracking-wider text-ink-2 uppercase">
                        {p.brand}
                      </p>
                      <h3 className="mt-1 text-body">
                        <Link href={`/p/${p.slug}`} className="hover:text-brand">
                          {p.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-small text-ink-2">
                        Жижиглэн: {money(p.price)}
                        {off !== null && (
                          <span className="ml-2 font-bold text-success">
                            бөөнөөр {off}% хямд
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <table className="w-full">
                    <caption className="sr-only">
                      {p.title} — бөөний үнийн шатлал
                    </caption>
                    <tbody className="divide-y divide-line">
                      {w.tiers.map((t) => (
                        <tr key={t.min}>
                          <th
                            scope="row"
                            className="px-4 py-2.5 text-left text-body font-normal text-ink"
                          >
                            {t.max ? `${t.min}–${t.max}` : `${t.min}+`} ширхэг
                          </th>
                          <td className="px-4 py-2.5 text-right text-h3 tabular-nums">
                            {money(t.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="border-t border-line bg-surface px-4 py-2.5 text-small text-ink-2">
                    Хамгийн бага захиалга: {w.minOrder} ширхэг
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Хэрхэн ажилладаг */}
        <section className="mt-12 lg:mt-16">
          <h2 className="text-h2">Хэрхэн ажилладаг вэ</h2>
          <ol className="mt-5 grid gap-4 lg:grid-cols-3 lg:gap-5">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="rounded-card border border-line bg-white p-5 lg:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-small font-bold text-white">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-brand" />
                </div>
                <h3 className="mt-4 text-h3">{title}</h3>
                <p className="mt-1.5 text-body text-ink-2">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Өргөдөл */}
        <section id="uroodol" className="mt-12 scroll-mt-24 lg:mt-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="rounded-card border border-line bg-white p-5 lg:p-6">
              <h2 className="text-h2">Бөөний эрхийн өргөдөл</h2>
              <p className="mt-1.5 text-small text-ink-2">
                Бүх талбарыг бөглөснөөр 1–2 ажлын өдөрт хариу өгнө.
              </p>
              <div className="mt-5">
                <WholesaleForm />
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-card bg-surface p-5">
                <h3 className="text-h3">Шаардлагатай бичиг баримт</h3>
                <ul className="mt-3 space-y-2 text-body text-ink-2">
                  <li>· Улсын бүртгэлийн гэрчилгээ (хуулийн этгээд)</li>
                  <li>· Иргэний үнэмлэхийн хуулбар (иргэн)</li>
                  <li>· Дансны мэдээлэл</li>
                </ul>
              </div>

              <div className="rounded-card bg-brand-tint p-5">
                <h3 className="text-h3">Түргэн холбогдох</h3>
                <p className="mt-2 text-body text-ink-2">
                  Бөөний хэлтэс · Даваа–Баасан, 09:00–18:00
                </p>
                <a
                  href="tel:77001234"
                  className="mt-3 block text-h3 text-brand hover:underline"
                >
                  7700-1234
                </a>
                <a
                  href="mailto:info@udshijan.mn"
                  className="mt-1 block text-body text-ink-2 hover:text-brand"
                >
                  info@udshijan.mn
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-12 lg:mt-16">
          <h2 className="text-h2">Түгээмэл асуултууд</h2>
          <Accordion items={FAQS} className="mt-5" />
          <p className="mt-4 text-body text-ink-2">
            Бусад асуултын хариуг{" "}
            <Link href="/tuslamj" className="font-bold text-brand hover:underline">
              тусламжийн төвөөс
            </Link>{" "}
            харна уу.
          </p>
        </section>
      </div>
    </Shell>
  );
}
