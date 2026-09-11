import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Placeholder } from "@/components/Placeholder";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Shell } from "@/components/layout/Shell";
import { ContactForm } from "@/components/shop/ContactForm";

export const metadata: Metadata = {
  title: "Холбоо барих",
  description:
    "Udshijan онлайн дэлгүүрийн утас, и-мэйл, хаяг болон ажиллах цагийн мэдээлэл.",
};

const CHANNELS = [
  {
    icon: Phone,
    title: "Утас",
    lines: ["7700-1234"],
    note: "Захиалга, лавлагаа",
    href: "tel:77001234",
  },
  {
    icon: Mail,
    title: "И-мэйл",
    lines: ["info@udshijan.mn"],
    note: "Ажлын өдөрт 24 цагийн дотор хариу өгнө",
    href: "mailto:info@udshijan.mn",
  },
  {
    icon: MapPin,
    title: "Хаяг",
    lines: ["Улаанбаатар", "Сүхбаатар дүүрэг, 1-р хороо"],
    note: "Салбараас очиж авах боломжтой",
  },
  {
    icon: Clock,
    title: "Ажиллах цаг",
    lines: ["Даваа–Ням", "09:00–20:00"],
    note: "Амралтын өдөр ч ажиллана",
  },
];

export default function ContactPage() {
  return (
    <Shell mobileTitle="Холбоо барих" mobileActions="cart">
      <div className="container-uds pb-10">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[{ label: "Нүүр", href: "/" }, { label: "Холбоо барих" }]}
          />
        </div>

        <div className="pt-4 lg:pt-2">
          <h1 className="hidden text-h1 lg:block">Холбоо барих</h1>
          <p className="max-w-2xl text-body text-ink-2 lg:mt-2">
            Захиалга, хүргэлт, буцаалттай холбоотой асуудлаар доорх сувгуудаар
            хандана уу. Түгээмэл асуултын хариуг{" "}
            <Link href="/tuslamj" className="font-bold text-brand hover:underline">
              тусламжийн төвөөс
            </Link>{" "}
            шууд олж болно.
          </p>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map(({ icon: Icon, title, lines, note, href }) => (
            <div key={title} className="bg-white p-5">
              <Icon className="size-6 text-brand" />
              <h2 className="mt-3 text-h3">{title}</h2>
              <div className="mt-1.5 text-body">
                {lines.map((line) =>
                  href ? (
                    <a
                      key={line}
                      href={href}
                      className="block font-bold hover:text-brand"
                    >
                      {line}
                    </a>
                  ) : (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-2 text-small text-ink-2">{note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <section className="rounded-card border border-line bg-white p-5 lg:p-6">
            <h2 className="text-h2">Зурвас илгээх</h2>
            <p className="mt-1.5 text-small text-ink-2">
              Захиалгын дугаараа бичвэл илүү хурдан шийдвэрлэнэ.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </section>

          <section>
            <h2 className="text-h2">Байршил</h2>
            <p className="mt-1.5 text-small text-ink-2">
              Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо
            </p>
            <Placeholder
              label="газрын зураг"
              size={[1200, 900]}
              className="mt-5 w-full overflow-hidden rounded-card border border-line"
            />
            <div className="mt-5 rounded-card bg-surface p-5 text-body text-ink-2">
              <p>
                Салбар дээр очиж бараагаа авах, буцаах, солих боломжтой. Ирэхээсээ
                өмнө{" "}
                <a href="tel:77001234" className="font-bold text-ink hover:text-brand">
                  7700-1234
                </a>{" "}
                руу залгаж үлдэгдэл шалгуулахыг зөвлөж байна.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}
