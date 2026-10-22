import Link from "next/link";
import { CircleSlash2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full border bg-secondary/60 text-muted-foreground">
        {icon ?? <CircleSlash2 className="size-5" aria-hidden />}
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function NoResultsState({
  query,
  onResetHref,
}: {
  query: string;
  onResetHref?: string;
}) {
  return (
    <EmptyState
      icon={<SearchX className="size-5" aria-hidden />}
      title={query ? `No matches for “${query}”` : "No records match the filters"}
      description={
        "Try a different spelling, clear a filter, or reset the view. Only records present in the imported dataset are shown — nothing is invented."
      }
      action={
        onResetHref ? (
          <Link
            href={onResetHref}
            className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/70"
          >
            Reset filters
          </Link>
        ) : undefined
      }
    />
  );
}
