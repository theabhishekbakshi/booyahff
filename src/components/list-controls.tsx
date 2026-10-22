import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildHref } from "@/lib/query";

/** Link-based filter tabs; server-rendered, no client JS. */
export function FilterTabs({
  basePath,
  currentParams,
  param,
  options,
  includeDefault = true,
  defaultLabel = "All",
  ariaLabel = "Filter by",
  className,
}: {
  basePath: string;
  currentParams: URLSearchParams | Record<string, string | string[] | undefined>;
  param: string;
  options: Array<{ value: string; label: string; count?: number | null }>;
  includeDefault?: boolean;
  defaultLabel?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const current =
    currentParams instanceof URLSearchParams
      ? currentParams.get(param)
      : ((currentParams[param] as string | undefined) ?? undefined);
  const selected = current && options.some((o) => o.value === current) ? current : null;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5", className)}
    >
      <ul className="flex gap-1.5">
        {includeDefault ? (
          <li>
            <FilterTab
              href={buildHref(basePath, currentParams, { [param]: null, page: null })}
              active={selected === null}
              label={defaultLabel}
              count={null}
            />
          </li>
        ) : null}
        {options.map((o) => (
          <li key={o.value}>
            <FilterTab
              href={buildHref(basePath, currentParams, { [param]: o.value, page: null })}
              active={selected === o.value}
              label={o.label}
              count={o.count ?? null}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FilterTab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number | null;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-brand/60 bg-brand-soft text-foreground"
          : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
      {count !== null && count !== undefined ? (
        <span className="font-mono text-[10px] text-muted-foreground">{count}</span>
      ) : null}
    </Link>
  );
}

/** Page-size pagination with prev/next links (URL-persisted). */
export function Pagination({
  basePath,
  currentParams,
  page,
  pageCount,
}: {
  basePath: string;
  currentParams: URLSearchParams | Record<string, string | string[] | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const pages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pageCount, page + 2); p++) pages.push(p);

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1">
      <PageLink
        href={page > 1 ? buildHref(basePath, currentParams, { page: page - 1 }) : undefined}
        disabled={page <= 1}
        label="Previous page"
      >
        Prev
      </PageLink>
      {pages[0] > 1 && (
        <>
          <PageLink href={buildHref(basePath, currentParams, { page: 1 })} page={1} />
          {pages[0] > 2 && <PageEllipsis />}
        </>
      )}
      {pages.map((p) => (
        <PageLink
          key={p}
          href={buildHref(basePath, currentParams, { page: p })}
          page={p}
          active={p === page}
        />
      ))}
      {pages[pages.length - 1] < pageCount && (
        <>
          {pages[pages.length - 1] < pageCount - 1 && <PageEllipsis />}
          <PageLink href={buildHref(basePath, currentParams, { page: pageCount })} page={pageCount} />
        </>
      )}
      <PageLink
        href={page < pageCount ? buildHref(basePath, currentParams, { page: page + 1 }) : undefined}
        disabled={page >= pageCount}
        label="Next page"
      >
        Next
      </PageLink>
    </nav>
  );
}

function PageEllipsis() {
  return <span aria-hidden className="px-1.5 text-sm text-muted-foreground">…</span>;
}

function PageLink({
  href,
  children,
  page,
  active,
  disabled,
  label,
}: {
  href?: string;
  children?: React.ReactNode;
  page?: number;
  active?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  if (disabled || !href) {
    return (
      <span
        aria-disabled
        aria-label={label}
        className="rounded-md px-3 py-1.5 text-sm text-muted-foreground/40"
      >
        {children ?? page}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label ?? `Page ${page}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "min-w-9 rounded-md border bg-card px-3 py-1.5 text-center text-sm transition-colors hover:bg-secondary",
        active && "border-brand/60 bg-brand-soft font-semibold",
      )}
    >
      {children ?? page}
    </Link>
  );
}
