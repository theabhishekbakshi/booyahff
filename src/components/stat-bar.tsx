import { cn } from "@/lib/utils";

/**
 * Horizontal stat meter for weapon numbers (they are 0–100 style stat points in
 * the dataset). Hides values that are not present in the data.
 */
export function StatBar({
  label,
  value,
  max = 100,
  suffix,
  className,
}: {
  label: string;
  value: number | null;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  if (value === null) return null;
  const pct = Math.max(4, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
        role="img"
        aria-label={`${label}: ${value} of ${max}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-signal transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Compact read-only stat cell for comparison tables. */
export function StatCell({
  value,
  highlight = false,
}: {
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-mono text-sm tabular-nums",
        value === null && "text-[11px] text-muted-foreground/60",
        highlight && value !== null && "font-semibold text-brand",
      )}
    >
      {value === null ? "Not available" : value}
    </span>
  );
}
