"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  CreditCard,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Alert, Badge, Chip, Rating, Skeleton } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Hint,
  Input,
  Label,
  QtyStepper,
  Select,
  SizeOption,
  Swatch,
} from "@/components/ui/Field";
import { ProductCard } from "@/components/shop/ProductCard";
import { products } from "@/lib/data/products";

const PALETTE = [
  { name: "Брэнд", hex: "#4A4394" },
  { name: "Брэнд / hover", hex: "#3B3578" },
  { name: "Брэнд / tint", hex: "#F0EFF9" },
  { name: "Гол текст", hex: "#17171A" },
  { name: "Хоёрдогч текст", hex: "#6B6B73" },
  { name: "Дэвсгэр / зураас", hex: "#F7F6F4 · #E4E3DF" },
];

const STATUS = [
  { name: "Амжилттай", hex: "#1F7A4D" },
  { name: "Сануулга", hex: "#A86400" },
  { name: "Алдаа / хямдрал", hex: "#B3261E" },
  { name: "Үнэлгээ", hex: "#E0A109" },
];

const TYPE_SCALE = [
  { spec: "Display · 48/1.1 · 800", cls: "text-display", sample: "Хэрэгцээт бүхэн" },
  { spec: "H1 · 32/1.2 · 800", cls: "text-h1", sample: "Эрэгтэй хувцас" },
  { spec: "H2 · 24/1.3 · 700", cls: "text-h2", sample: "Их борлуулалттай бараа" },
  { spec: "H3 · 18/1.4 · 700", cls: "text-h3", sample: "Хүргэлтийн мэдээлэл" },
  {
    spec: "Body · 15/1.65 · 400",
    cls: "text-body",
    sample: "Захиалга баталгаажсанаас хойш 24–48 цагийн дотор хүргэлт хийгдэнэ.",
  },
  { spec: "Small · 13/1.5 · 500", cls: "text-small", sample: "Үлдэгдэл: 12 ширхэг" },
  {
    spec: "Caption · 11/1.4 · mono",
    cls: "text-caption font-mono",
    sample: "SKU: UDS-TS-1042",
  },
  { spec: "Price · 22/1 · 800", cls: "text-price", sample: "59,900₮" },
  { spec: "Button · 14/1 · 700", cls: "text-btn", sample: "Сагсанд нэмэх" },
];

const SPACING = [4, 8, 12, 16, 24, 32, 48, 56];
const RADII = [
  { px: 6, name: "input" },
  { px: 8, name: "button" },
  { px: 10, name: "card" },
  { px: 14, name: "sheet" },
];

const ICONS = [
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  ChevronDown,
  SlidersHorizontal,
  Truck,
  Check,
  AlertCircle,
  X,
  CreditCard,
];

export default function StyleguidePage() {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("L");
  const [color, setColor] = useState("Хар");

  const cardSamples = [
    products[0],
    products[1],
    products[2],
    products[3],
  ];

  return (
    <main className="bg-surface py-8">
      <div className="container-uds">
        <div className="rounded-card border border-line bg-white p-6 lg:p-12">
          {/* Толгой */}
          <header className="border-b border-line pb-6">
            <p className="font-mono text-caption tracking-[0.16em] text-ink-2 uppercase">
              Дизайн систем v1.0
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
              <h1 className="text-h1 lg:text-[38px]">Udshijan Online Shop</h1>
              <dl className="flex flex-wrap gap-8 text-small">
                <Meta label="ФОНТ" value="Manrope" />
                <Meta label="ГРИД" value="1328 / 12 багана / 20px" />
                <Meta label="ХЭЛ" value="Монгол (кирилл)" />
              </dl>
            </div>
          </header>

          {/* Өнгө */}
          <Block title="Өнгөний систем">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
              {PALETTE.map((c) => (
                <div key={c.name}>
                  <div
                    className="h-24 rounded-card border border-line"
                    style={{ background: c.hex.split(" · ")[0] }}
                  />
                  <p className="mt-2.5 text-small">{c.name}</p>
                  <p className="font-mono text-caption text-ink-2">{c.hex}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-6">
              {STATUS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 rounded-card border border-line p-3"
                >
                  <span
                    className="size-6 shrink-0 rounded-[6px]"
                    style={{ background: c.hex }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-small">{c.name}</p>
                    <p className="font-mono text-caption text-ink-2">{c.hex}</p>
                  </div>
                </div>
              ))}
              {[
                ["Сүүдэр / sm", "shadow-sm", "0 1px 2px 5%"],
                ["Сүүдэр / md", "shadow-md", "0 6px 20px 10%"],
              ].map(([name, cls, spec]) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-card border border-line p-3"
                >
                  <span
                    className={`size-6 shrink-0 rounded-[6px] border border-line bg-white ${cls}`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-small">{name}</p>
                    <p className="font-mono text-caption text-ink-2">{spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Фонт + зай/радиус */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <section>
              <Heading>Фонтын шатлал</Heading>
              <dl className="divide-y divide-line">
                {TYPE_SCALE.map((t) => (
                  <div
                    key={t.spec}
                    className="grid grid-cols-1 items-baseline gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
                  >
                    <dt className="font-mono text-caption text-ink-2">{t.spec}</dt>
                    <dd className={t.cls}>{t.sample}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <Heading>Зай ба радиус</Heading>
              <div className="flex items-end gap-2">
                {SPACING.map((s) => (
                  <div key={s} className="text-center">
                    <div
                      className="rounded-[3px] bg-brand"
                      style={{ width: s, height: s }}
                    />
                    <span className="mt-2 block font-mono text-caption text-ink-2">
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                {RADII.map((r) => (
                  <div key={r.px} className="text-center">
                    <div
                      className="size-14 border border-line bg-surface"
                      style={{ borderRadius: r.px }}
                    />
                    <span className="mt-2 block font-mono text-caption text-ink-2">
                      {r.px} · {r.name}
                    </span>
                  </div>
                ))}
              </div>

              <Heading className="mt-10">Айкон</Heading>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((Icon, i) => (
                  <span
                    key={i}
                    className="flex size-11 items-center justify-center rounded-btn border border-line"
                  >
                    <Icon className="size-5" />
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Товч */}
          <Block title="Товч — төлөвүүд">
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
              <Cell label="Primary / default">
                <Button fullWidth>Сагсанд нэмэх</Button>
              </Cell>
              <Cell label="Primary / hover">
                <Button fullWidth className="bg-brand-hover">
                  Сагсанд нэмэх
                </Button>
              </Cell>
              <Cell label="Primary / focus">
                <Button
                  fullWidth
                  className="ring-2 ring-brand/40 ring-offset-2 outline-none"
                >
                  Сагсанд нэмэх
                </Button>
              </Cell>
              <Cell label="Primary / loading">
                <Button fullWidth loading>
                  Хадгалж байна…
                </Button>
              </Cell>
              <Cell label="Primary / disabled">
                <Button fullWidth disabled>
                  Үлдэгдэл дууссан
                </Button>
              </Cell>
              <Cell label="Destructive">
                <Button variant="destructive" fullWidth>
                  Захиалга цуцлах
                </Button>
              </Cell>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3 lg:grid-cols-6">
              <Cell label="Secondary">
                <Button variant="secondary" fullWidth>
                  Дэлгэрэнгүй
                </Button>
              </Cell>
              <Cell label="Tertiary">
                <Button variant="tertiary" fullWidth>
                  Шууд авах
                </Button>
              </Cell>
              <Cell label="Ghost">
                <Button variant="ghost" fullWidth>
                  Бүгдийг харах
                </Button>
              </Cell>
              <Cell label="Small">
                <Button size="sm" variant="secondary">
                  Шүүлтүүр цэвэрлэх
                </Button>
              </Cell>
              <Cell label="Тоо хэмжээ">
                <QtyStepper value={qty} onChange={setQty} />
              </Cell>
              <Cell label="Icon / 44px">
                <div className="flex gap-2">
                  <IconButton aria-label="Хүслийн">
                    <Heart className="size-5" />
                  </IconButton>
                  <IconButton aria-label="Хүслээс хасах" active>
                    <Heart className="size-5 fill-current" />
                  </IconButton>
                </div>
              </Cell>
            </div>
          </Block>

          {/* Оролт / тэмдэг / мэдэгдэл */}
          <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12">
            <section>
              <Heading>Оролтын талбар</Heading>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="sg-phone">Утасны дугаар</Label>
                  <Input id="sg-phone" placeholder="8 оронтой дугаар" />
                </div>
                <div>
                  <Label htmlFor="sg-name">Хүлээн авагчийн нэр</Label>
                  <Input id="sg-name" defaultValue="Батбаярын Сүрэн" />
                </div>
                <div>
                  <Label htmlFor="sg-email">Имэйл</Label>
                  <Input id="sg-email" defaultValue="suren@" error />
                  <Hint error>Имэйл хаяг буруу байна.</Hint>
                </div>
                <div>
                  <Label htmlFor="sg-district">Дүүрэг</Label>
                  <Select id="sg-district" defaultValue="">
                    <option value="" disabled>
                      Сонгох
                    </option>
                    <option>Сүхбаатар</option>
                    <option>Чингэлтэй</option>
                    <option>Баянзүрх</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sg-disabled">Disabled төлөв</Label>
                  <Input id="sg-disabled" placeholder="Идэвхгүй" disabled />
                </div>
              </div>
            </section>

            <section>
              <Heading>Тэмдэг, чип, үнэлгээ</Heading>
              <div className="flex flex-wrap gap-2">
                <Badge tone="sale">-20%</Badge>
                <Badge tone="wholesale">Бөөний үнэтэй</Badge>
                <Badge tone="inStock">Үлдэгдэлтэй</Badge>
                <Badge tone="lowStock">Багахан үлдсэн</Badge>
                <Badge tone="outOfStock">Үлдэгдэл дууссан</Badge>
                <Badge tone="new">Шинэ</Badge>
              </div>

              <p className="mt-6 mb-2.5 text-small text-ink-2">
                Активтай шүүлтүүр — чип
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Chip onRemove={() => {}}>Хар</Chip>
                <Chip onRemove={() => {}}>L</Chip>
                <Chip onRemove={() => {}}>50,000₮ хүртэл</Chip>
                <button className="text-small font-bold text-brand underline underline-offset-2">
                  Цэвэрлэх
                </button>
              </div>

              <p className="mt-6 mb-2.5 text-small text-ink-2">Үнэлгээ</p>
              <Rating value={4.8} count={24} suffix="үнэлгээ" size="md" />

              <p className="mt-6 mb-2.5 text-small text-ink-2">
                Өнгө ба размерын сонголт
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Хар", hex: "#17171A" },
                  { name: "Цагаан", hex: "#FFFFFF" },
                  { name: "Цэнхэр", hex: "#3B5B84" },
                ].map((c) => (
                  <Swatch
                    key={c.name}
                    {...c}
                    withLabel
                    selected={color === c.name}
                    onClick={() => setColor(c.name)}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <SizeOption
                    key={s}
                    label={s}
                    disabled={s === "XXL"}
                    selected={size === s}
                    onClick={() => setSize(s)}
                  />
                ))}
              </div>
            </section>

            <section>
              <Heading>Мэдэгдэл, хоосон, лоад</Heading>
              <div className="space-y-3">
                <Alert>Төлбөр амжилтгүй боллоо. Дахин оролдоно уу.</Alert>
                <Alert tone="success">NAIM8 код хэрэглэгдсэн · −15%</Alert>
              </div>

              <div className="mt-5 rounded-card border border-line">
                <EmptyState
                  icon={<Heart className="size-6" />}
                  title="Таны хүслийн жагсаалт хоосон байна"
                  description="Таалагдсан бүтээгдэхүүнээ хадгалж, дараа нь худалдан аваарай."
                  actionLabel="Бүтээгдэхүүн үзэх"
                  actionHref="/c/huvtsas"
                />
              </div>

              <p className="mt-5 mb-2.5 text-small text-ink-2">Loading skeleton</p>
              <div className="space-y-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </section>
          </div>

          {/* Картын хувилбарууд */}
          <Block title="Бүтээгдэхүүний карт — хувилбарууд">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
              {cardSamples.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Block>
        </div>
      </div>
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <Heading>{title}</Heading>
      {children}
    </section>
  );
}

function Heading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mb-4 font-mono text-caption tracking-[0.16em] text-ink-2 uppercase ${className}`}
    >
      {children}
    </h2>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-caption tracking-[0.12em] text-ink-2">
        {label}
      </dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 font-mono text-caption text-ink-2">{label}</p>
      {children}
    </div>
  );
}
