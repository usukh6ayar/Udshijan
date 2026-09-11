/** 39900 → "39,900₮" */
export function money(value: number): string {
  return `${value.toLocaleString("en-US")}₮`;
}

/** 1284 → "1,284" */
export function num(value: number): string {
  return value.toLocaleString("en-US");
}

/** 49900 → 39900 = -20 (бүхэл тоо, тэмдэггүй) */
export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
