import type { Metadata } from "next";
import { Suspense } from "react";
import { WeaponCard } from "@/components/game-cards";
import { NoResultsState } from "@/components/empty-state";
import { FilterSearch } from "@/components/filter-search";
import { FilterTabs, Pagination } from "@/components/list-controls";
import { SortSelect, type SortOption } from "@/components/sort-select";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { getWeapons, normalizeQuery, searchGameData } from "@/lib/data";
import { queryToString } from "@/lib/query";
import { pageMetadata } from "@/lib/seo";

const PAGE_SIZE = 24;

const SORTS: SortOption[] = [
  { value: "default", label: "Name (A → Z)" },
  { value: "-name", label: "Name (Z → A)" },
  { value: "damage", label: "Damage (high → low)" },
  { value: "rate", label: "Rate of fire (high → low)" },
];

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// searchParams-driven listing: blocks until the query resolves so status codes
// and filtering stay exact for every request combination
export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Weapons",
  description:
    "All Free Fire weapons in the dataset: damage, rate of fire, range, magazine size, store price and special attributes — with data-verification info.",
  path: "/weapons",
});

export default async function WeaponsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normalizeQuery(queryToString(params.q) ?? "");
  const type = queryToString(params.type) ?? null;
  const sort = queryToString(params.sort) ?? "default";

  const all = await getWeapons();

  let filtered = all;
  if (q) {
    const found = await searchGameData(q, { kind: "weapon", limit: 500 });
    const ids = new Set(found.map((f) => f.id));
    filtered = filtered.filter((w) => ids.has(w.id));
  }
  if (type) filtered = filtered.filter((w) => w.primaryType === type);

  const types = [...new Set(all.map((w) => w.primaryType).filter(Boolean))] as string[];
  const typeOptions = types
    .sort()
    .map((t) => ({
      value: t,
      label: t,
      count: all.filter((w) => w.primaryType === t).length,
    }));

  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case "-name":
        return b.name.localeCompare(a.name);
      case "damage":
        return (b.damage ?? -1) - (a.damage ?? -1) || a.name.localeCompare(b.name);
      case "rate":
        return (b.rateOfFire ?? -1) - (a.rateOfFire ?? -1) || a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(queryToString(params.page) ?? 1) || 1), pageCount);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const query = queryToString(params.q) ?? "";

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={`${all.length} weapons in dataset`}
        title="Weapons"
        description="Numbers are stored stat points from the imported dataset (in-game stat panel scale). Some weapon types have fewer recorded stats — missing values are shown as 'Not available' on detail pages and omitted on cards."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <FilterSearch placeholder="Search weapons…" className="flex-1 sm:max-w-sm" />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-[170px]" />}>
            <SortSelect options={SORTS} value={sort} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-8" />}>
          <FilterTabs
            basePath="/weapons"
            currentParams={params}
            param="type"
            options={typeOptions}
            ariaLabel="Filter weapons by type"
          />
        </Suspense>
      </HeadingSection>

      {total === 0 ? (
        <NoResultsState query={query} onResetHref="/weapons" />
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
            Showing {pageItems.length} of {total} weapon{total === 1 ? "" : "s"}
            {query ? ` matching “${query}”` : ""}
          </p>
          <Reveal className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((w) => (
              <WeaponCard key={w.id} weapon={w} />
            ))}
          </Reveal>
          <Pagination basePath="/weapons" currentParams={params} page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
