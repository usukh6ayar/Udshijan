"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { Placeholder } from "@/components/Placeholder";
import { Alert, Skeleton } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Checkbox,
  FieldRow,
  Input,
  RadioCard,
  Select,
  Textarea,
} from "@/components/ui/Field";
import { OrderSummary } from "./OrderSummary";
import { lineKey, toPricedLine, useCart } from "@/lib/cart";
import {
  computeTotals,
  FREE_SHIPPING_FROM,
  shippingFeeFor,
  type ShippingMethod,
} from "@/lib/pricing";
import { money } from "@/lib/format";
import {
  CITIES,
  DISTRICTS,
  INITIAL_CHECKOUT,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutForm,
} from "@/lib/orders/validate";
import { placeOrder } from "@/lib/orders/actions";

/* ── Хүргэлт, төлбөрийн сонголтууд ─────────────────────────────────────── */

const SHIPPING_METHODS: {
  key: ShippingMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "standard",
    label: "Стандарт хүргэлт",
    description: `24–48 цагт хүргэнэ · ${money(FREE_SHIPPING_FROM)}-с дээш захиалгад үнэгүй`,
    icon: <Truck className="size-5" />,
  },
  {
    key: "express",
    label: "Шуурхай хүргэлт",
    description: "Ажлын өдөр 14:00-с өмнө захиалбал ижил өдөртөө",
    icon: <Zap className="size-5" />,
  },
  {
    key: "pickup",
    label: "Салбараас очиж авах",
    description: "Сүхбаатар дүүрэг, 1-р хороо · Даваа–Ням 09:00–20:00",
    icon: <Store className="size-5" />,
  },
];

const PAYMENT_METHODS = [
  {
    key: "qpay",
    label: "QPay",
    description: "QR кодоор банкны аппаас төлнө",
    icon: <Smartphone className="size-5" />,
  },
  {
    key: "card",
    label: "Картаар төлөх",
    description: "Visa, Mastercard, UnionPay",
    icon: <CreditCard className="size-5" />,
  },
  {
    key: "transfer",
    label: "Банкны шилжүүлэг",
    description: "Дансны мэдээллийг захиалгын дараа илгээнэ",
    icon: <Building2 className="size-5" />,
  },
  {
    key: "cash",
    label: "Хүргэлтийн үед бэлнээр",
    description: "Барааг хүлээн авахдаа төлнө",
    icon: <Banknote className="size-5" />,
  },
] as const;

export function CheckoutView() {
  const { lines, coupon, resolved, clear, loading } = useCart();
  const [form, setForm] = useState<CheckoutForm>(INITIAL_CHECKOUT);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [problems, setProblems] = useState<string[]>([]);
  /** Захиалга үүссэний дараа шилжих хүртэл «хоосон сагс» харагдахаас сэргийлнэ */
  const [placed, setPlaced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const totals = useMemo(
    () =>
      computeTotals({
        lines: resolved.map(toPricedLine),
        couponCode: coupon,
        shipping: form.shipping,
      }),
    [resolved, coupon, form.shipping],
  );

  function set<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (submitted) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const found = validateCheckout(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Эхний алдаатай талбар руу аваачна
      const firstKey = Object.keys(found)[0];
      const el = formRef.current?.querySelector<HTMLElement>(
        `[name="${firstKey}"], #${firstKey}`,
      );
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    setProblems([]);
    startTransition(async () => {
      const res = await placeOrder({ form, lines, coupon });
      if (res.ok) {
        setPlaced(true);
        clear();
        router.push(`/zahialga/${res.number}`);
        return;
      }
      setErrors(res.errors ?? {});
      setProblems(res.problems ?? []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── Захиалга үүссэн, захиалгын хуудас руу шилжиж байна ─────────────── */
  if (placed) {
    return (
      <div className="container-uds py-10 lg:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-5 text-h1">Захиалга хүлээн авлаа</h1>
          <p className="mt-3 text-body text-ink-2">Захиалгын хуудас руу шилжиж байна…</p>
        </div>
      </div>
    );
  }

  /* ── Сагсны бараа ачаалж байна ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="container-uds py-6 lg:py-10">
        <h1 className="text-h1">Захиалга баталгаажуулах</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <Skeleton className="h-[420px] border border-line" />
          <Skeleton className="h-[240px] border border-line" />
        </div>
      </div>
    );
  }

  /* ── Сагс хоосон ────────────────────────────────────────────────────── */
  if (resolved.length === 0) {
    return (
      <div className="container-uds py-10">
        <h1 className="text-h1">Захиалга баталгаажуулах</h1>
        <div className="mt-6 rounded-card border border-line bg-white">
          <EmptyState
            icon={<ShoppingCart className="size-6" />}
            title="Сагс хоосон байна"
            description="Захиалга хийхийн тулд эхлээд бараа сонгож сагсандаа нэмнэ үү."
            actionLabel="Бүтээгдэхүүн үзэх"
            actionHref="/c/huvtsas"
          />
        </div>
      </div>
    );
  }

  const hasErrors = submitted && Object.keys(errors).length > 0;
  const needsAddress = form.shipping !== "pickup";

  return (
    <div className="container-uds py-6 lg:py-10">
      <h1 className="text-h1">Захиалга баталгаажуулах</h1>
      <p className="mt-1.5 text-body text-ink-2">
        {resolved.length} бүтээгдэхүүн · {money(totals.total)}
      </p>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8"
      >
        <div className="space-y-4">
          {hasErrors && (
            <Alert>Дутуу эсвэл буруу бөглөсөн талбаруудыг шалгана уу.</Alert>
          )}
          {problems.map((p) => (
            <Alert key={p}>{p}</Alert>
          ))}

          <FormSection step={1} title="Холбоо барих мэдээлэл">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldRow id="name" label="Нэр" required error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Овог, нэр"
                  value={form.name}
                  error={Boolean(errors.name)}
                  onChange={(e) => set("name", e.target.value)}
                />
              </FieldRow>

              <FieldRow
                id="phone"
                label="Утасны дугаар"
                required
                error={errors.phone}
                hint="Хүргэлтийн үед холбогдоно"
              >
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9911-2233"
                  value={form.phone}
                  error={Boolean(errors.phone)}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </FieldRow>

              <FieldRow
                id="email"
                label="И-мэйл"
                error={errors.email}
                hint="Заавал биш — баримт илгээхэд ашиглана"
                className="sm:col-span-2"
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={form.email}
                  error={Boolean(errors.email)}
                  onChange={(e) => set("email", e.target.value)}
                />
              </FieldRow>
            </div>
          </FormSection>

          <FormSection step={2} title="Хүргэлтийн арга">
            <div className="space-y-3">
              {SHIPPING_METHODS.map((m) => (
                <RadioCard
                  key={m.key}
                  id={`shipping-${m.key}`}
                  name="shipping"
                  icon={m.icon}
                  label={m.label}
                  description={m.description}
                  checked={form.shipping === m.key}
                  onChange={() => set("shipping", m.key)}
                  meta={(() => {
                    const fee = shippingFeeFor(m.key, totals.subtotal);
                    if (fee === 0) return "Үнэгүй";
                    return m.key === "express" ? `+${money(fee)}` : money(fee);
                  })()}
                />
              ))}
            </div>
          </FormSection>

          {needsAddress && (
            <FormSection step={3} title="Хүргэлтийн хаяг">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow id="city" label="Хот / Аймаг" required>
                  <Select
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </FieldRow>

                <FieldRow id="district" label="Дүүрэг / Сум" required>
                  <Select
                    id="district"
                    name="district"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </Select>
                </FieldRow>

                <FieldRow
                  id="khoroo"
                  label="Хороо"
                  required
                  error={errors.khoroo}
                >
                  <Input
                    id="khoroo"
                    name="khoroo"
                    placeholder="ж: 4-р хороо"
                    value={form.khoroo}
                    error={Boolean(errors.khoroo)}
                    onChange={(e) => set("khoroo", e.target.value)}
                  />
                </FieldRow>

                <FieldRow
                  id="address"
                  label="Байр, орц, тоот"
                  required
                  error={errors.address}
                >
                  <Input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="ж: 45-р байр, 2 орц, 18 тоот"
                    value={form.address}
                    error={Boolean(errors.address)}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </FieldRow>

                <FieldRow
                  id="note"
                  label="Нэмэлт заавар"
                  hint="Орцны код, хаалганы тэмдэглэл гэх мэт"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Хүргэлтийн үед анхаарах зүйл…"
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                  />
                </FieldRow>
              </div>
            </FormSection>
          )}

          <FormSection step={needsAddress ? 4 : 3} title="Төлбөрийн арга">
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <RadioCard
                  key={m.key}
                  id={`payment-${m.key}`}
                  name="payment"
                  icon={m.icon}
                  label={m.label}
                  description={m.description}
                  checked={form.payment === m.key}
                  onChange={() => set("payment", m.key)}
                />
              ))}
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <Checkbox
                id="terms"
                checked={form.terms}
                error={Boolean(errors.terms)}
                onChange={(v) => set("terms", v)}
                label={
                  <>
                    <Link
                      href="/tuslamj/butsaalt"
                      className="font-bold text-brand hover:underline"
                    >
                      Буцаалтын нөхцөл
                    </Link>{" "}
                    болон үйлчилгээний нөхцөлийг зөвшөөрч байна
                  </>
                }
              />
              {errors.terms && (
                <p className="mt-1.5 text-small text-danger">{errors.terms}</p>
              )}
            </div>
          </FormSection>
        </div>

        {/* Баруун багана — дүн ба барааны жагсаалт */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            totals={totals}
            footer={
              <>
                <Button type="submit" size="lg" fullWidth loading={pending}>
                  Захиалга баталгаажуулах
                </Button>
                <p className="text-center text-small text-ink-2">
                  Төлбөр демо горимд — бодит мөнгө шилжихгүй
                </p>
              </>
            }
          />

          <details
            open
            className="group overflow-hidden rounded-card border border-line bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-h3 hover:bg-surface">
              Захиалгын бараа
              <span className="text-small font-normal text-ink-2">
                {resolved.length} ширхэг нэр
              </span>
            </summary>
            <ul className="divide-y divide-line border-t border-line">
              {resolved.map((line) => (
                <li key={lineKey(line)} className="flex gap-3 px-5 py-3">
                  <Placeholder
                    label={line.product.imageLabel}
                    ratio="1/1"
                    bare
                    className="w-14 shrink-0 overflow-hidden rounded-[6px] border border-line"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/p/${line.product.slug}`}
                      className="line-clamp-2 text-small hover:text-brand"
                    >
                      {line.product.titleFull ?? line.product.title}
                    </Link>
                    <p className="mt-0.5 text-small text-ink-2">
                      {[line.color, line.size].filter(Boolean).join(" · ")}
                      {line.color || line.size ? " · " : ""}
                      {line.qty} ширхэг
                    </p>
                  </div>
                  <span className="shrink-0 text-small font-bold tabular-nums">
                    {money(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-3">
              <Link
                href="/cart"
                className="text-small font-bold text-brand hover:underline"
              >
                Сагс засах
              </Link>
            </div>
          </details>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2.5 text-h3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-small font-bold text-white">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
