import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/format";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover disabled:bg-line disabled:text-ink-2",
  secondary:
    "bg-white text-ink border border-ink hover:bg-surface disabled:border-line disabled:text-ink-2",
  tertiary:
    "bg-white text-ink border border-line hover:bg-surface disabled:text-ink-2",
  ghost: "bg-transparent text-brand hover:bg-brand-tint disabled:text-ink-2",
  destructive:
    "bg-white text-danger border border-danger hover:bg-danger hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 gap-1.5",
  md: "h-11 px-4 gap-2",
  lg: "h-12 px-6 gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-btn text-btn whitespace-nowrap transition-colors disabled:cursor-not-allowed";

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth?: boolean,
  className?: string,
) {
  return cx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...rest
}: BaseProps & ComponentProps<"button">) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classesFor(variant, size, fullWidth, className)}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...rest
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={classesFor(variant, size, fullWidth, className)}>
      {children}
    </Link>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
    />
  );
}

/** 44px дөрвөлжин айкон товч (дизайны "Icon / 44px") */
export function IconButton({
  className,
  children,
  active,
  ...rest
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-btn border transition-colors",
        active
          ? "border-brand bg-brand-tint text-brand"
          : "border-line bg-white text-ink hover:bg-surface",
        className,
      )}
    >
      {children}
    </button>
  );
}
