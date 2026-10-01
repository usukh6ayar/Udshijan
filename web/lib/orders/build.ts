import type { OrderItem } from "./types";

/** Нэг мөрийн дээд тоо — төлбөргүй захиалгаар үлдэгдэл түгжихийг хязгаарлана */
export const MAX_QTY = 20;
const MAX_LINES = 50;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CartInputLine = {
  slug: string;
  color?: string;
  size?: string;
  qty: number;
};

/** `reserveStock`-ийн буцаадаг, захиалгын үеийн барааны мэдээлэл */
export type ReservedProduct = {
  slug: string;
  title: string;
  sku: string;
  price: number;
  compareAt: number | null;
};

/** Хэрэглэгчид харуулах асуудлууд — transaction-ыг буцаахын тулд шиднэ */
export class OrderProblem extends Error {
  constructor(readonly problems: string[]) {
    super(problems.join("; "));
  }
}

function optionalText(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  return typeof value === "string" && value.length <= 50 ? value : null;
}

/** Клиентийн сагсыг шалгана. Аль нэг мөр буруу бол бүгдийг татгалзаж null. */
export function parseCartLines(raw: unknown): CartInputLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;

  const lines: CartInputLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const { slug, qty, color, size } = item as Record<string, unknown>;
    if (typeof slug !== "string" || !SLUG_RE.test(slug)) return null;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return null;
    }
    const c = optionalText(color);
    const s = optionalText(size);
    if (c === null || s === null) return null;
    lines.push({
      slug,
      qty,
      ...(c !== undefined && { color: c }),
      ...(s !== undefined && { size: s }),
    });
  }
  return lines;
}

/** slug → нийт тоо. Үлдэгдэл барааны түвшинд тул вариантуудыг нэгтгэнэ. */
export function mergeQuantities<T extends { slug: string; qty: number }>(
  lines: T[],
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const line of lines) {
    merged.set(line.slug, (merged.get(line.slug) ?? 0) + line.qty);
  }
  return merged;
}

export function toOrderItems(
  lines: CartInputLine[],
  reserved: Map<string, ReservedProduct>,
): OrderItem[] {
  return lines.map((line) => {
    const product = reserved.get(line.slug);
    if (!product) throw new Error(`Захиалаагүй бараа: ${line.slug}`);
    return {
      slug: line.slug,
      title: product.title,
      sku: product.sku,
      ...(line.color !== undefined && { color: line.color }),
      ...(line.size !== undefined && { size: line.size }),
      qty: line.qty,
      unitPrice: product.price,
    };
  });
}
