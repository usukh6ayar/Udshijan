"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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
import { Button, ButtonLink } from "@/components/ui/Button";
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
} from "@/lib/pricing";
import { money } from "@/lib/format";

/* ── Хүргэлт, төлбөрийн сонголтууд ─────────────────────────────────────── */

type ShippingKey = "standard" | "express" | "pickup";

const SHIPPING_METHODS: {
  key: ShippingKey;
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

/** Дизайны footer дээрх хаягтай нийцүүлсэн жагсаалт */
const CITIES = [
  "Улаанбаатар",
  "Дархан-Уул",
  "Орхон",
  "Сэлэнгэ",
  "Төв",
  "Бусад аймаг",
];

const DISTRICTS = [
  "Баянгол",
  "Баянзүрх",
  "Хан-Уул",
  "Сонгинохайрхан",
  "Сүхбаатар",
  "Чингэлтэй",
  "Налайх",
  "Багануур",
  "Багахангай",
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  khoroo: string;
  address: string;
  note: string;
  shipping: ShippingKey;
  payment: string;
  terms: boolean;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  city: CITIES[0],
  district: DISTRICTS[0],
  khoroo: "",
  address: "",
  note: "",
  shipping: "standard",
  payment: "qpay",
  terms: false,
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};

  if (form.name.trim().length < 2) errors.name = "Нэрээ бүтэн бичнэ үү.";

  const digits = form.phone.replace(/\D/g, "");
  if (digits.length !== 8) errors.phone = "Утасны дугаар 8 оронтой байх ёстой.";

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "И-мэйл хаяг буруу байна.";
  }

  // Салбараас авах үед хүргэлтийн хаяг шаардлагагүй
  if (form.shipping !== "pickup") {
    if (!form.khoroo.trim()) errors.khoroo = "Хороогоо оруулна уу.";
    if (form.address.trim().length < 4) {
      errors.address = "Байр, орц, тоотоо тодорхой бичнэ үү.";
    }
  }

  if (!form.terms) errors.terms = "Үйлчилгээний нөхцөлийг зөвшөөрнө үү.";

  return errors;
}

/** Захиалгын дугаар — зөвхөн илгээх үед үүсгэнэ (render дотор үүсгэвэл hydration зөрчинө) */
function makeOrderNumber(): string {
  const now = new Date();
  const date = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const tail = String(Math.floor(Math.random() * 10_000)).padStart(4, "0");
  return `UDS-${date}-${tail}`;
}

export function CheckoutView() {
  const { coupon, resolved, clear, loading } = useCart();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<{ number: string; total: number } | null>(
    null,
  );
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

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (submitted) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const found = validate(form);
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

    setOrder({ number: makeOrderNumber(), total: totals.total });
    clear();
  }

  /* ── Амжилтын төлөв ─────────────────────────────────────────────────── */
  if (order) {
    return (
      <div className="container-uds py-10 lg:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-5 text-h1">Захиалга хүлээн авлаа</h1>
          <p className="mt-3 text-body text-ink-2">
            {form.name}, таны захиалгыг бүртгэлээ. Оператор{" "}
            <span className="font-bold text-ink">{form.phone}</span> дугаарт
            холбогдож баталгаажуулна.
          </p>

          <dl className="mt-7 divide-y divide-line overflow-hidden rounded-card border border-line bg-white text-left">
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <dt className="text-ink-2">Захиалгын дугаар</dt>
              <dd className="font-mono text-body font-bold tracking-wider">
                {order.number}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <dt className="text-ink-2">Төлөх дүн</dt>
              <dd className="text-h3 tabular-nums">{money(order.total)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <dt className="text-ink-2">Хүргэлт</dt>
              <dd className="text-body font-bold">
                {SHIPPING_METHODS.find((m) => m.key === form.shipping)?.label}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-5 py-4">
              <dt className="text-ink-2">Төлбөрийн арга</dt>
              <dd className="text-body font-bold">
                {PAYMENT_METHODS.find((m) => m.key === form.payment)?.label}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <Alert tone="success">
              Энэ бол демо дэлгүүр — захиалга сервер рүү илгээгдээгүй бөгөөд
              төлбөр татагдахгүй.
            </Alert>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/tuslamj/zahialga" size="lg">
              Захиалга хянах
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" size="lg">
              Нүүр хуудас руу буцах
            </ButtonLink>
          </div>
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
                <Button type="submit" size="lg" fullWidth>
                  Захиалга баталгаажуулах
                </Button>
                <p className="text-center text-small text-ink-2">
                  Демо дэлгүүр — төлбөр татагдахгүй
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
