/** Монгол Улс зуны цагт шилждэггүй — тогтмол UTC+8 */
const UB_OFFSET_MS = 8 * 60 * 60 * 1000;

export const ORDER_NUMBER_RE = /^UDS-\d{6}-\d{4}$/;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `UDS-YYMMDD-NNNN`. Давхардлыг DB-ийн primary key барина, дуудагч дахин оролдоно. */
export function makeOrderNumber(
  now: Date = new Date(),
  random: () => number = Math.random,
): string {
  const ub = new Date(now.getTime() + UB_OFFSET_MS);
  const date =
    String(ub.getUTCFullYear()).slice(2) +
    pad2(ub.getUTCMonth() + 1) +
    pad2(ub.getUTCDate());
  const tail = String(Math.floor(random() * 10_000)).padStart(4, "0");
  return `UDS-${date}-${tail}`;
}

export function normalizeOrderNumber(input: string): string | null {
  const value = input.trim().toUpperCase();
  return ORDER_NUMBER_RE.test(value) ? value : null;
}
