"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * Мобайлын bottom sheet (1f — шүүлтүүр).
 * Радиус 14px = дизайны "sheet" токен.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      <button
        type="button"
        aria-label="Хаах"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[85vh] w-full flex-col rounded-t-sheet bg-white shadow-md"
      >
        <div className="flex shrink-0 flex-col">
          <span
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-line"
          />
          <div className="flex items-center justify-between px-4 pt-3 pb-4">
            <h2 className="text-h2">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Хаах"
              className="flex size-9 items-center justify-center rounded-btn hover:bg-surface"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-line px-4 py-4">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-line px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
