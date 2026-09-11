import type { ReactNode } from "react";
import { ButtonLink } from "./Button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-surface text-ink-2">
        {icon}
      </div>
      <h3 className="text-h3">{title}</h3>
      <p className="mt-1.5 max-w-xs text-body text-ink-2">{description}</p>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}
