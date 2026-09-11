import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

const CONTROL =
  "w-full rounded-input border bg-white px-3 text-body text-ink placeholder:text-ink-2 " +
  "transition-colors focus:outline-none focus-visible:outline-none " +
  "disabled:bg-surface disabled:text-ink-2 disabled:cursor-not-allowed";

const OK = "border-line focus:border-brand focus:ring-2 focus:ring-brand/25";
const BAD = "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20";

export function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-small text-ink">
      {children}
    </label>
  );
}

export function Hint({
  children,
  error,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p className={cx("mt-1.5 text-small", error ? "text-danger" : "text-ink-2")}>
      {children}
    </p>
  );
}

export function Input({
  error,
  className,
  ...rest
}: ComponentProps<"input"> & { error?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={error || undefined}
      className={cx(CONTROL, "h-11", error ? BAD : OK, className)}
    />
  );
}

export function Select({
  error,
  className,
  children,
  ...rest
}: ComponentProps<"select"> & { error?: boolean }) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cx(
          CONTROL,
          "h-11 appearance-none pr-9",
          error ? BAD : OK,
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-2"
      />
    </div>
  );
}

export function Textarea({
  error,
  className,
  ...rest
}: ComponentProps<"textarea"> & { error?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={error || undefined}
      className={cx(CONTROL, "min-h-28 py-2.5", error ? BAD : OK, className)}
    />
  );
}

/**
 * Label + control + алдаа/тайлбарыг нэг дор багцалсан жижиг wrapper.
 * Формын хуудсууд дээр давтагдах 6 мөрийг нэг мөр болгоно.
 */
export function FieldRow({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  /** Алдаагүй үеийн тайлбар */
  hint?: string;
  /** Алдааны текст — байвал улаанаар гарна */
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        )}
      </Label>
      {children}
      {(error || hint) && <Hint error={Boolean(error)}>{error ?? hint}</Hint>}
    </div>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  description,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: string;
  error?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={error || undefined}
        className={cx(
          "mt-0.5 size-4 shrink-0 rounded-[4px] accent-brand",
          error ? "border-danger" : "border-line",
        )}
      />
      <label htmlFor={id} className="text-body">
        {label}
        {description && (
          <span className="mt-0.5 block text-small text-ink-2">{description}</span>
        )}
      </label>
    </div>
  );
}

/**
 * Хүргэлт / төлбөрийн аргын сонголт — том дарах талбайтай радио карт.
 * Баруун талд үнэ эсвэл тэмдэглэгээ гарна.
 */
export function RadioCard({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  meta,
  icon,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
  meta?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cx(
        "flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors",
        checked
          ? "border-brand bg-brand-tint"
          : "border-line bg-white hover:bg-surface",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-brand"
      />
      {icon && <span className="mt-px shrink-0 text-ink">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-body font-bold">{label}</span>
        {description && (
          <span className="mt-0.5 block text-small text-ink-2">{description}</span>
        )}
      </span>
      {meta && (
        <span className="shrink-0 text-small font-bold tabular-nums">{meta}</span>
      )}
    </label>
  );
}

/** Дизайны "Тоо хэмжээ" алхамчлагч: − N + */
export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn =
    "flex items-center justify-center text-ink transition-colors hover:bg-surface " +
    "disabled:text-line disabled:hover:bg-transparent disabled:cursor-not-allowed";
  const box = size === "sm" ? "h-9" : "h-11";
  const cell = size === "sm" ? "w-8" : "w-10";

  return (
    <div
      className={cx(
        "inline-flex items-center overflow-hidden rounded-input border border-line bg-white",
        box,
      )}
    >
      <button
        type="button"
        aria-label="Тоо хэмжээ хасах"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cx(btn, cell, "h-full")}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cx(
          "flex h-full min-w-9 items-center justify-center border-x border-line px-1 text-small tabular-nums",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Тоо хэмжээ нэмэх"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cx(btn, cell, "h-full")}
      >
        +
      </button>
    </div>
  );
}

/** Дизайны "Бусад" хэсгийн toggle */
export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-body text-ink">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-brand" : "bg-line",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[left]",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/** Өнгөний swatch (шүүлтүүр ба вариант сонголт) */
export function Swatch({
  hex,
  name,
  selected,
  onClick,
  withLabel = false,
  disabled,
}: {
  hex: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
  withLabel?: boolean;
  disabled?: boolean;
}) {
  const dot = (
    <span
      className="size-6 shrink-0 rounded-[4px] border border-line"
      style={{ background: hex }}
    />
  );

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cx(
          "inline-flex h-11 items-center gap-2 rounded-btn border px-3 text-small transition-colors",
          selected
            ? "border-brand bg-brand-tint text-ink"
            : "border-line bg-white hover:bg-surface",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        {dot}
        {name}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={name}
      title={name}
      className={cx(
        "flex size-9 items-center justify-center rounded-[6px] border-2 transition-colors",
        selected ? "border-ink" : "border-transparent hover:border-line",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className="size-7 rounded-[4px] border border-line"
        style={{ background: hex }}
      />
    </button>
  );
}

/** Размерын сонголт (S M L XL XXL) */
export function SizeOption({
  label,
  selected,
  disabled,
  onClick,
  compact = false,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Шүүлтүүрийн 280px самбарт багтаах нарийн хувилбар */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cx(
        "h-11 rounded-btn border text-small transition-colors",
        compact ? "min-w-12 px-2" : "min-w-14 px-3",
        disabled
          ? "cursor-not-allowed border-line bg-surface text-ink-2 line-through"
          : selected
            ? "border-brand bg-brand-tint text-brand"
            : "border-line bg-white text-ink hover:bg-surface",
      )}
    >
      {label}
    </button>
  );
}
