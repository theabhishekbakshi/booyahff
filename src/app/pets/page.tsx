import type { Metadata } from "next";
import { Suspense } from "react";
import { PetCard } from "@/components/game-cards";
import { NoResultsState } from "@/components/empty-state";
import { FilterSearch } from "@/components/filter-search";
import { FilterTabs, Pagination } from "@/components/list-controls";
import { SortSelect, type SortOption } from "@/components/sort-select";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { getPets, normalizeQuery, searchGameData } from "@/lib/data";
import { queryToString } from "@/lib/query";
import { pageMetadata } from "@/lib/seo";
import { titleCase } from "@/lib/format";

const PAGE_SIZE = 24;

const SORTS: SortOption[] = [
  { value: "default", label: "Name (A → Z)" },
  { value: "-name", label: "Name (Z → A)" },
  { value: "role", label: "Role" },
];

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// searchParams-driven listing: blocks until the query resolves so status codes
// and filtering stay exact for every request combination
export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Pets",
  description:
    "Every Free Fire pet in the dataset: pet skills, usefulness categories and descriptions as documented by the community dataset.",
  path: "/pets",
});

export default async function PetsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normalizeQuery(queryToString(params.q) ?? "");
  const role = queryToString(params.role) ?? null;
  const sort = queryToString(params.sort) ?? "default";

  const all = await getPets();

  let filtered = all;
  if (q) {
    const found = await searchGameData(q, { kind: "pet", limit: 500 });
    const ids = new Set(found.map((f) => f.id));
    filtered = filtered.filter((p) => ids.has(p.id));
  }
  if (role) filtered = filtered.filter((p) => p.role === role);

  const roles = [...new Set(all.map((p) => p.role).filter(Boolean))] as string[];
  const roleOptions = roles
    .sort()
    .map((r) => ({
      value: r,
      label: titleCase(r),
      count: all.filter((p) => p.role === r).length,
    }));

  filtered = [...filtered].sort((a, b) => {
    if (sort === "-name") return b.name.localeCompare(a.name);
    if (sort === "role") return (a.role ?? "").localeCompare(b.role ?? "") || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(queryToString(params.page) ?? 1) || 1), pageCount);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const query = queryToString(params.q) ?? "";

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={`${all.length} pets in dataset`}
        title="Pets"
        description="Pet skills are endurance/support effects that run alongside your character ability. Skill descriptions come exactly from the imported dataset."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <FilterSearch placeholder="Search pets or skills…" className="flex-1 sm:max-w-sm" />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-[170px]" />}>
            <SortSelect options={SORTS} value={sort} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-8" />}>
          <FilterTabs
            basePath="/pets"
            currentParams={params}
            param="role"
            options={roleOptions}
            ariaLabel="Filter pets by role"
          />
        </Suspense>
      </HeadingSection>

      {total === 0 ? (
        <NoResultsState query={query} onResetHref="/pets" />
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
            Showing {pageItems.length} of {total} pet{total === 1 ? "" : "s"}
            {query ? ` matching “${query}”` : ""}
          </p>
          <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {pageItems.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </Reveal>
          <Pagination basePath="/pets" currentParams={params} page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
