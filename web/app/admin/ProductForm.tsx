"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { saveProduct } from "@/lib/admin/actions";
import type { Product } from "@/lib/data/types";

function json(value: unknown): string {
  return value === undefined || value === null ? "" : JSON.stringify(value, null, 2);
}

/** Нэг талбар + түүний алдааны мессеж */
function Row({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-small text-ink-2">{label}</span>
      {children}
      {error ? <span className="text-small text-danger">{error}</span> : null}
    </label>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const [errors, formAction, pending] = useActionState(saveProduct, null);
  const v = product;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <Row label="Slug (URL-д гарна)" error={errors?.slug}>
        <Input
          name="slug"
          defaultValue={v?.slug}
          readOnly={Boolean(v)}
          error={Boolean(errors?.slug)}
          placeholder="eregtei-hovon-futbolk"
        />
      </Row>

      <Row label="SKU" error={errors?.sku}>
        <Input name="sku" defaultValue={v?.sku} error={Boolean(errors?.sku)} />
      </Row>

      <Row label="Брэнд" error={errors?.brand}>
        <Input name="brand" defaultValue={v?.brand} error={Boolean(errors?.brand)} />
      </Row>

      <Row label="Нэр" error={errors?.title}>
        <Input name="title" defaultValue={v?.title} error={Boolean(errors?.title)} />
      </Row>

      <Row label="Бүтэн нэр (заавал биш)">
        <Input name="titleFull" defaultValue={v?.titleFull ?? ""} />
      </Row>

      <Row label="Ангилал" error={errors?.category}>
        <Input name="category" defaultValue={v?.category} error={Boolean(errors?.category)} />
      </Row>

      <Row label="Дэд ангилал" error={errors?.subcategory}>
        <Input
          name="subcategory"
          defaultValue={v?.subcategory}
          error={Boolean(errors?.subcategory)}
        />
      </Row>

      <Row label="Хүйс" error={errors?.section}>
        <Select name="section" defaultValue={v?.section ?? ""} error={Boolean(errors?.section)}>
          <option value="">— хүйсгүй —</option>
          <option value="eregtei">Эрэгтэй</option>
          <option value="emegtei">Эмэгтэй</option>
        </Select>
      </Row>

      <Row label="Үнэ (₮)" error={errors?.price}>
        <Input name="price" defaultValue={v?.price} error={Boolean(errors?.price)} />
      </Row>

      <Row label="Хямдралын өмнөх үнэ (заавал биш)">
        <Input name="compareAt" defaultValue={v?.compareAt ?? ""} />
      </Row>

      <Row label="Үнэлгээ (0–5)" error={errors?.rating}>
        <Input name="rating" defaultValue={v?.rating} error={Boolean(errors?.rating)} />
      </Row>

      <Row label="Сэтгэгдлийн тоо" error={errors?.reviewCount}>
        <Input
          name="reviewCount"
          defaultValue={v?.reviewCount}
          error={Boolean(errors?.reviewCount)}
        />
      </Row>

      <Row label="Зарагдсан тоо (заавал биш)">
        <Input name="soldCount" defaultValue={v?.soldCount ?? ""} />
      </Row>

      <Row label="Үлдэгдэл" error={errors?.stock}>
        <Input name="stock" defaultValue={v?.stock} error={Boolean(errors?.stock)} />
      </Row>

      <p className="-mt-2 text-small text-ink-2">
        Үлдэгдэл 0 бол бүх хэмжээ дууссан гэж харагдана.
      </p>

      <Row label="Зургийн бичиг" error={errors?.imageLabel}>
        <Input
          name="imageLabel"
          defaultValue={v?.imageLabel}
          error={Boolean(errors?.imageLabel)}
        />
      </Row>

      <Row label="Зургийн тоо" error={errors?.imageCount}>
        <Input
          name="imageCount"
          defaultValue={v?.imageCount}
          error={Boolean(errors?.imageCount)}
        />
      </Row>

      <Row label="Тайлбар" error={errors?.description}>
        <Textarea
          name="description"
          defaultValue={v?.description}
          rows={4}
          error={Boolean(errors?.description)}
        />
      </Row>

      <p className="mt-2 text-small text-ink-2">
        Доорх талбаруудыг JSON хэлбэрээр бичнэ. Буруу бичвэл хадгалахад алдаа гарна.
      </p>

      {errors?.colors ? <Alert>{errors.colors}</Alert> : null}

      <Row label="Өнгө (colors)">
        <Textarea name="colors" defaultValue={json(v?.colors)} rows={4} />
      </Row>

      <Row label="Хэмжээ (sizes)">
        <Textarea name="sizes" defaultValue={json(v?.sizes)} rows={4} />
      </Row>

      <Row label="Үзүүлэлт (specs)">
        <Textarea name="specs" defaultValue={json(v?.specs)} rows={4} />
      </Row>

      <Row label="Бөөний үнэ (wholesale)">
        <Textarea name="wholesale" defaultValue={json(v?.wholesale)} rows={4} />
      </Row>

      <Row label="Тэмдэг (badges)">
        <Textarea name="badges" defaultValue={json(v?.badges)} rows={2} />
      </Row>

      <Row label="Онцлох (featured)">
        <Textarea name="featured" defaultValue={json(v?.featured)} rows={2} />
      </Row>

      <Row label="Тайлбарын нэмэлт мөрүүд (descriptionNotes)">
        <Textarea name="descriptionNotes" defaultValue={json(v?.descriptionNotes)} rows={3} />
      </Row>

      <Button type="submit" loading={pending} fullWidth>
        Хадгалах
      </Button>
    </form>
  );
}
