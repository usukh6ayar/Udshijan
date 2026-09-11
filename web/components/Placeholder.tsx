import { cx } from "@/lib/format";

type PlaceholderProps = {
  /** Төвд гарах бичиг, ж: "футболк" → «футболк · зураг» */
  label?: string;
  /** Бодит зургийн хэмжээ, ж: [1200, 1500] → «1200 × 1500» */
  size?: [number, number];
  /** aspect-ratio, ж: "3/4". Өгөгдөөгүй бол size-аас тооцно. */
  ratio?: string;
  className?: string;
  /** Голд нь бичиг харуулахгүй (жижиг thumbnail) */
  bare?: boolean;
  /** Суурь өнгө — хар/tint баннер дээр placeholder-ыг тааруулна */
  tone?: "light" | "dark" | "tint";
};

const TONES = {
  light: { hatch: "hatch", chip: "bg-white/70 text-ink-2" },
  dark: { hatch: "hatch-dark", chip: "bg-white/10 text-white/55" },
  tint: { hatch: "hatch-tint", chip: "bg-white/60 text-brand/70" },
} as const;

/**
 * Дизайн дээрх зурагны түр орлуулагч.
 * «бодит зураг ирэхэд солино» — солихдоо зөвхөн энэ компонентыг <Image>-ээр орлуулна.
 */
export function Placeholder({
  label,
  size,
  ratio,
  className,
  bare = false,
  tone = "light",
}: PlaceholderProps) {
  const aspect = ratio ?? (size ? `${size[0]}/${size[1]}` : undefined);
  const t = TONES[tone];

  return (
    <div
      className={cx(t.hatch, "relative flex items-center justify-center", className)}
      style={aspect ? { aspectRatio: aspect } : undefined}
      role="img"
      aria-label={label ? `${label} — зургийн байрлал` : "зургийн байрлал"}
    >
      {!bare && (label || size) && (
        <span
          className={cx(
            "rounded-[4px] px-2 py-1 text-center font-mono text-caption tracking-wider",
            t.chip,
          )}
        >
          {label && <span className="block">{label} · зураг</span>}
          {size && (
            <span className="block">
              {size[0]} × {size[1]}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
