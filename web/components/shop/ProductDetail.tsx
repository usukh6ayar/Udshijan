"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CreditCard, Heart, Truck } from "lucide-react";
import { useState } from "react";
import { Placeholder } from "@/components/Placeholder";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Badge, Rating } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QtyStepper, SizeOption, Swatch } from "@/components/ui/Field";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cx, discountPercent, money, num } from "@/lib/format";
import type { Product } from "@/lib/data/types";

export function ProductDetail({
  product,
  categoryName,
  categorySlug,
}: {
  product: Product;
  categoryName: string;
  categorySlug: string;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]?.name);
  const [size, setSize] = useState(
    product.sizes.find((s) => s.label === "L" && s.inStock)?.label ??
      product.sizes.find((s) => s.inStock)?.label,
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);

  const off = discountPercent(product.price, product.compareAt);
  const soldOut = product.stock === 0;
  const outOfStockSizes = product.sizes.filter((s) => !s.inStock);

  function onAdd() {
    add({ slug: product.slug, color, size, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function onBuyNow() {
    add({ slug: product.slug, color, size, qty });
    router.push("/checkout");
  }

  return (
    <>
      <div className="container-uds pb-10">
        <div className="hidden lg:block">
          <Breadcrumb
            items={[
              { label: "Нүүр", href: "/" },
              { label: categoryName, href: `/c/${categorySlug}` },
              ...(product.section === "eregtei"
                ? [
                    {
                      label: "Эрэгтэй",
                      href: `/c/${categorySlug}?section=eregtei`,
                    },
                  ]
                : []),
              { label: product.title },
            ]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <Gallery
            product={product}
            off={off}
            wished={wished}
            onWish={() => toggle(product.slug)}
          />

          <div className="lg:pt-2">
            <p className="font-mono text-caption tracking-wider text-ink-2 uppercase">
              {product.brand} · SKU: {product.sku}
            </p>

            <h1 className="mt-2.5 text-h1">{product.titleFull ?? product.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Rating
                value={product.rating}
                count={product.reviewCount}
                suffix="үнэлгээ"
                size="md"
              />
              {product.soldCount && (
                <>
                  <span aria-hidden className="hidden text-line sm:inline">
                    |
                  </span>
                  <span className="text-small text-ink-2">
                    {num(product.soldCount)} удаа худалдаж авсан
                  </span>
                </>
              )}
            </div>

            {/* Үнийн блок */}
            <div className="mt-5 rounded-card bg-surface p-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[34px] leading-none font-extrabold">
                  {money(product.price)}
                </span>
                {product.compareAt && (
                  <span className="text-body text-ink-2 line-through">
                    {money(product.compareAt)}
                  </span>
                )}
                {off !== null && <Badge tone="sale">-{off}%</Badge>}
              </div>

              <p
                className={cx(
                  "mt-3 flex items-center gap-1.5 text-small",
                  soldOut
                    ? "text-ink-2"
                    : product.stock <= 5
                      ? "text-warning"
                      : "text-success",
                )}
              >
                {!soldOut && <Check className="size-4" />}
                {soldOut
                  ? "Үлдэгдэл дууссан"
                  : `Үлдэгдэлтэй · ${product.stock} ширхэг бэлэн`}
              </p>
            </div>

            {/* Өнгө */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="mb-2.5 text-small">
                  Өнгө: <span className="text-ink-2">{color}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <Swatch
                      key={c.name}
                      hex={c.hex}
                      name={c.name}
                      withLabel
                      selected={color === c.name}
                      onClick={() => setColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Размер */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="mb-2.5 flex items-center justify-between gap-4">
                  <p className="text-small">
                    Размер: <span className="text-ink-2">{size}</span>
                  </p>
                  <button
                    type="button"
                    className="text-small font-bold text-brand underline underline-offset-2 hover:no-underline"
                  >
                    Размерын хүснэгт
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <SizeOption
                      key={s.label}
                      label={s.label}
                      disabled={!s.inStock}
                      selected={size === s.label}
                      onClick={() => setSize(s.label)}
                    />
                  ))}
                </div>
                {outOfStockSizes.length > 0 && (
                  <p className="mt-2.5 text-small text-ink-2">
                    {outOfStockSizes.map((s) => s.label).join(", ")} размер
                    одоогоор үлдэгдэлгүй.
                  </p>
                )}
              </div>
            )}

            {/* Тоо хэмжээ + үйлдлүүд — мобайл дээр доод sticky bar-т байдаг */}
            <div className="mt-7 hidden lg:block">
              <p className="mb-2.5 text-small">Тоо хэмжээ</p>
              <div className="flex flex-wrap items-center gap-3">
                <QtyStepper
                  value={qty}
                  onChange={setQty}
                  max={Math.max(1, product.stock)}
                />
                <Button
                  onClick={onAdd}
                  disabled={soldOut}
                  className="min-w-44 flex-1 sm:flex-none"
                >
                  {soldOut
                    ? "Үлдэгдэл дууссан"
                    : added
                      ? "Сагсанд нэмэгдлээ"
                      : "Сагсанд нэмэх"}
                </Button>
                {/* Сагсанд нэмээд шууд захиалгын урсгал руу — checkout нь
                    дизайны дараагийн хэсэгт багтана */}
                <Button
                  variant="secondary"
                  disabled={soldOut}
                  onClick={onBuyNow}
                  className="min-w-32"
                >
                  Шууд авах
                </Button>
                <button
                  type="button"
                  onClick={() => toggle(product.slug)}
                  aria-label={
                    wished
                      ? "Хүслийн жагсаалтаас хасах"
                      : "Хүслийн жагсаалтад нэмэх"
                  }
                  aria-pressed={wished}
                  className="flex size-11 shrink-0 items-center justify-center rounded-btn border border-line bg-white hover:bg-surface"
                >
                  <Heart
                    className={cx("size-5", wished && "fill-danger text-danger")}
                  />
                </button>
              </div>
            </div>

            {product.wholesale && <WholesaleTable product={product} />}

            <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line">
              <InfoRow icon={Truck} title={`Улаанбаатар: 24–48 цаг · ${money(5000)}`}>
                100,000₮-с дээш захиалгад хүргэлт үнэгүй
              </InfoRow>
              <InfoRow icon={Check} title="14 хоногийн дотор буцаах боломжтой">
                Хэрэглээгүй, шошготой бараанд хамаарна
              </InfoRow>
              <InfoRow icon={CreditCard} title="QPay, карт, банкны шилжүүлэг">
                Хүргэлтийн үед бэлнээр төлөх боломжтой
              </InfoRow>
            </ul>
          </div>
        </div>

        <ProductTabs product={product} />
      </div>

      {/* 1f — мобайлын доод sticky bar (таб барын дээр) */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white p-3 shadow-md lg:hidden">
        <div className="flex items-center gap-3">
          <QtyStepper
            value={qty}
            onChange={setQty}
            max={Math.max(1, product.stock)}
          />
          <Button onClick={onAdd} disabled={soldOut} fullWidth>
            {soldOut ? "Үлдэгдэл дууссан" : added ? "Нэмэгдлээ" : "Сагсанд нэмэх"}
          </Button>
        </div>
      </div>
    </>
  );
}

function Gallery({
  product,
  off,
  wished,
  onWish,
}: {
  product: Product;
  off: number | null;
  wished: boolean;
  onWish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const thumbs = Math.min(4, product.imageCount);
  const extra = product.imageCount - thumbs;

  return (
    <div className="flex gap-3">
      <div className="hidden w-[92px] shrink-0 flex-col gap-3 lg:flex">
        {Array.from({ length: thumbs }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}-р зураг`}
            aria-pressed={index === i}
            className={cx(
              "overflow-hidden rounded-card border-2 transition-colors",
              index === i ? "border-brand" : "border-line hover:border-ink-2",
            )}
          >
            <Placeholder ratio="1/1" bare />
          </button>
        ))}
        {extra > 0 && (
          <button
            type="button"
            className="flex aspect-square items-center justify-center rounded-card border border-line bg-surface text-small text-ink-2 hover:bg-white"
          >
            +{extra}
          </button>
        )}
      </div>

      <div className="relative min-w-0 flex-1">
        <Placeholder
          label="барааны гол"
          size={[1200, 1500]}
          className="w-full overflow-hidden rounded-card border border-line"
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between">
          {off !== null ? <Badge tone="sale">-{off}%</Badge> : <span />}
          <button
            type="button"
            onClick={onWish}
            aria-label="Хүслийн жагсаалтад нэмэх"
            aria-pressed={wished}
            className="hidden size-10 items-center justify-center rounded-full border border-line bg-white shadow-sm hover:bg-surface lg:flex"
          >
            <Heart className={cx("size-5", wished && "fill-danger text-danger")} />
          </button>
        </div>

        {/* Мобайлын carousel цэгүүд */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden">
          {Array.from({ length: thumbs }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}-р зураг`}
              className={cx(
                "h-1.5 rounded-full transition-all",
                index === i ? "w-5 bg-ink" : "w-1.5 bg-ink/25",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WholesaleTable({ product }: { product: Product }) {
  const w = product.wholesale!;
  return (
    <div className="mt-6 overflow-hidden rounded-card border border-brand/25">
      <div className="flex items-center justify-between gap-3 bg-brand-tint px-4 py-3">
        <h2 className="text-h3 text-ink">Бөөний үнэ</h2>
        <span className="text-small font-bold text-brand">
          Бөөний эрхтэй хэрэглэгчид
        </span>
      </div>
      <table className="w-full">
        <caption className="sr-only">Бөөний үнийн шатлал</caption>
        <tbody className="divide-y divide-line">
          {w.tiers.map((t) => (
            <tr key={t.min}>
              <th
                scope="row"
                className="px-4 py-3 text-left text-body font-normal text-ink"
              >
                {t.max ? `${t.min}–${t.max}` : `${t.min}+`} ширхэг
              </th>
              <td className="px-4 py-3 text-right text-h3 tabular-nums">
                {money(t.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3">
        <p className="text-small text-ink-2">
          Хамгийн бага захиалга: {w.minOrder} ширхэг
        </p>
        <Link
          href="/booniy-hudaldaa"
          className="inline-flex items-center gap-1.5 text-small font-bold text-brand hover:underline"
        >
          Бөөний эрх хүсэх
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Truck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 px-4 py-3.5">
      <Icon className="mt-0.5 size-5 shrink-0 text-ink" />
      <div>
        <p className="text-body">{title}</p>
        <p className="mt-0.5 text-small text-ink-2">{children}</p>
      </div>
    </li>
  );
}

const TABS = ["Тайлбар", "Үзүүлэлт", "Үнэлгээ", "Хүргэлт, буцаалт"] as const;

function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Тайлбар");

  return (
    <section className="mt-12 lg:mt-16">
      <div
        role="tablist"
        aria-label="Бүтээгдэхүүний мэдээлэл"
        className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "shrink-0 border-b-2 pb-3 text-body whitespace-nowrap transition-colors",
              tab === t
                ? "border-ink font-bold text-ink"
                : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {t}
            {t === "Үнэлгээ" && (
              <span className="ml-1.5 text-ink-2">({product.reviewCount})</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
        <div>
          {tab === "Тайлбар" && (
            <>
              <p className="max-w-2xl text-body text-ink">{product.description}</p>
              {product.descriptionNotes && (
                <ul className="mt-4 space-y-1.5 text-body text-ink-2">
                  {product.descriptionNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "Үзүүлэлт" && <SpecTable product={product} />}

          {tab === "Үнэлгээ" && (
            <div className="flex flex-col gap-4">
              <Rating
                value={product.rating}
                count={product.reviewCount}
                suffix="үнэлгээ"
                size="md"
              />
              <p className="text-body text-ink-2">
                Хэрэглэгчийн бичсэн сэтгэгдлүүд удахгүй нэмэгдэнэ.
              </p>
            </div>
          )}

          {tab === "Хүргэлт, буцаалт" && (
            <ul className="space-y-2 text-body text-ink-2">
              <li>Улаанбаатар хотод 24–48 цагийн дотор хүргэнэ.</li>
              <li>100,000₮-с дээш захиалгад хүргэлт үнэгүй.</li>
              <li>
                Хэрэглээгүй, шошготой барааг 14 хоногийн дотор буцаах боломжтой.
              </li>
            </ul>
          )}
        </div>

        {tab === "Тайлбар" && (
          <div className="lg:pt-1">
            <h3 className="mb-3 text-h3">Үзүүлэлт</h3>
            <SpecTable product={product} />
          </div>
        )}
      </div>
    </section>
  );
}

function SpecTable({ product }: { product: Product }) {
  return (
    <table className="w-full max-w-md overflow-hidden rounded-card border border-line">
      <tbody className="divide-y divide-line">
        {product.specs.map((s) => (
          <tr key={s.label}>
            <th
              scope="row"
              className="w-2/5 bg-surface px-4 py-2.5 text-left text-small font-medium text-ink-2"
            >
              {s.label}
            </th>
            <td className="px-4 py-2.5 text-body">{s.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
