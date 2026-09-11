"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Truck, X } from "lucide-react";
import { useState } from "react";
import { Placeholder } from "@/components/Placeholder";
import { Alert } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, QtyStepper } from "@/components/ui/Field";
import { OrderSummary } from "./OrderSummary";
import { lineKey, useCart, type ResolvedLine } from "@/lib/cart";
import { cx, money } from "@/lib/format";

export function CartView() {
  const { resolved, totals, coupon, couponRate } = useCart();

  if (resolved.length === 0) {
    return (
      <div className="container-uds py-10">
        <h1 className="text-h1">Таны сагс</h1>
        <div className="mt-6 rounded-card border border-line bg-white">
          <EmptyState
            icon={<ShoppingCart className="size-6" />}
            title="Таны сагс хоосон байна"
            description="Таалагдсан бүтээгдэхүүнээ сагсанд нэмээд захиалгаа хийгээрэй."
            actionLabel="Бүтээгдэхүүн үзэх"
            actionHref="/c/huvtsas"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-uds py-6 lg:py-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-h1">Таны сагс</h1>
        <p className="text-body text-ink-2">{resolved.length} бүтээгдэхүүн</p>
      </div>

      {totals.freeShipping && (
        <div className="mt-4 lg:hidden">
          <Alert tone="success">Хүргэлт үнэгүй болсон</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div className="hidden grid-cols-[minmax(0,1fr)_120px_150px_120px_44px] items-center gap-4 border-b border-line bg-surface px-5 py-3 text-caption font-bold tracking-[0.08em] text-ink-2 lg:grid">
            <span>БҮТЭЭГДЭХҮҮН</span>
            <span>ҮНЭ</span>
            <span>ТОО ХЭМЖЭЭ</span>
            <span className="text-right">ДҮН</span>
            <span />
          </div>

          <ul className="divide-y divide-line">
            {resolved.map((line) => (
              <CartRow key={lineKey(line)} line={line} />
            ))}
          </ul>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            totals={totals}
            footer={
              <>
                <ButtonLink href="/checkout" size="lg" fullWidth>
                  Захиалга хийх
                </ButtonLink>
                <ButtonLink
                  href="/c/huvtsas"
                  variant="secondary"
                  size="lg"
                  fullWidth
                >
                  Худалдан авалтаа үргэлжлүүлэх
                </ButtonLink>
              </>
            }
          />
          <CouponForm coupon={coupon} couponRate={couponRate} />
          <WholesaleCallout />

          <div className="flex gap-3 rounded-card bg-surface px-4 py-3.5 text-small text-ink-2">
            <Truck className="mt-0.5 size-5 shrink-0 text-ink" />
            <p>
              Захиалга баталгаажсанаас хойш{" "}
              <span className="font-bold text-ink">24–48 цагийн</span> дотор
              хүргэнэ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartRow({ line }: { line: ResolvedLine }) {
  const { setQty, remove } = useCart();
  const key = lineKey(line);
  const p = line.product;
  const variants = [line.color, line.size].filter(Boolean).join(" · ");

  return (
    <li className="grid grid-cols-[72px_minmax(0,1fr)_36px] items-start gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_120px_150px_120px_44px] lg:items-center lg:gap-4 lg:p-5">
      <div className="lg:flex lg:min-w-0 lg:items-center lg:gap-4">
        <Link href={`/p/${p.slug}`} className="block shrink-0">
          <Placeholder
            label={p.imageLabel}
            ratio="1/1"
            bare
            className="w-[72px] overflow-hidden rounded-[6px] border border-line lg:w-[88px]"
          />
        </Link>
        <div className="hidden min-w-0 lg:block">
          <Link href={`/p/${p.slug}`} className="text-body hover:text-brand">
            {p.titleFull ?? p.title}
          </Link>
          {variants && <p className="mt-1 text-small text-ink-2">{variants}</p>}
          <p className="mt-1 font-mono text-caption tracking-wider text-ink-2">
            {p.sku}
          </p>
          {p.stock > 0 && p.stock <= 5 && (
            <p className="mt-1 text-small text-warning">
              Зөвхөн {p.stock} ширхэг үлдсэн
            </p>
          )}
        </div>
      </div>

      {/* Мобайл */}
      <div className="min-w-0 lg:hidden">
        <Link href={`/p/${p.slug}`} className="text-body hover:text-brand">
          {p.titleFull ?? p.title}
        </Link>
        {variants && <p className="mt-1 text-small text-ink-2">{variants}</p>}
        {p.stock > 0 && p.stock <= 5 && (
          <p className="mt-1 text-small text-warning">
            Зөвхөн {p.stock} ширхэг үлдсэн
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <QtyStepper
            value={line.qty}
            onChange={(q) => setQty(key, q)}
            min={0}
            max={Math.max(1, p.stock)}
            size="sm"
          />
          <span className="text-h3 tabular-nums">{money(line.lineTotal)}</span>
        </div>
      </div>

      {/* Дэлгэц */}
      <div className="hidden lg:block">
        <span className="text-body font-bold tabular-nums">{money(p.price)}</span>
        {p.compareAt && (
          <span className="mt-0.5 block text-small text-ink-2 line-through tabular-nums">
            {money(p.compareAt)}
          </span>
        )}
      </div>

      <div className="hidden lg:block">
        <QtyStepper
          value={line.qty}
          onChange={(q) => setQty(key, q)}
          min={0}
          max={Math.max(1, p.stock)}
        />
      </div>

      <span className="hidden text-right text-h3 tabular-nums lg:block">
        {money(line.lineTotal)}
      </span>

      <button
        type="button"
        onClick={() => remove(key)}
        aria-label={`${p.title} — сагснаас хасах`}
        className="flex size-9 items-center justify-center justify-self-end rounded-btn border border-line text-ink-2 hover:bg-surface hover:text-ink lg:size-11"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

function CouponForm({
  coupon,
  couponRate,
}: {
  coupon: string | null;
  couponRate: number;
}) {
  const { applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = applyCoupon(code);
    setError(!ok);
    if (ok) setCode("");
  }

  return (
    <div className="rounded-card border border-line bg-white p-5">
      <h2 className="text-h3">Хямдралын код</h2>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          error={error}
          placeholder="Кодоо оруулна уу"
          aria-label="Хямдралын код"
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Хэрэглэх
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-small text-danger">
          Ийм код олдсонгүй. Дахин шалгана уу.
        </p>
      )}

      {coupon && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-small text-success">
            ✓ {coupon} код хэрэглэгдсэн · −{Math.round(couponRate * 100)}%
          </p>
          <button
            type="button"
            onClick={removeCoupon}
            className="text-small text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Хасах
          </button>
        </div>
      )}
    </div>
  );
}

function WholesaleCallout() {
  return (
    <div className="rounded-card bg-brand-tint p-5">
      <h2 className="text-h3">Бөөний эрхтэй бол хямд</h2>
      <p className="mt-2 text-body text-ink-2">
        Эдгээр барааг 10-с дээш ширхгээр авбал 22,000₮-с үнэ тооцно.
      </p>
      <Link
        href="/booniy-hudaldaa"
        className="mt-4 inline-flex items-center gap-1.5 text-small font-bold text-brand hover:underline"
      >
        Бөөний эрх хүсэх
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
