import type { Metadata } from "next";
import { Suspense } from "react";
import { CharacterCard } from "@/components/game-cards";
import { NoResultsState } from "@/components/empty-state";
import { FilterSearch } from "@/components/filter-search";
import { FilterTabs, Pagination } from "@/components/list-controls";
import { SortSelect, type SortOption } from "@/components/sort-select";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { getCharacters, searchGameData } from "@/lib/data";
import { normalizeQuery } from "@/lib/data";
import { queryToString } from "@/lib/query";
import { pageMetadata } from "@/lib/seo";
import { titleCase } from "@/lib/format";

const PAGE_SIZE = 24;

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: "Name (A → Z)" },
  { value: "-name", label: "Name (Z → A)" },
  { value: "skill", label: "Ability type" },
];

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// searchParams-driven listing: blocks until the query resolves so status codes
// and filtering stay exact for every request combination
export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Characters",
  description:
    "Browse every Free Fire character in the dataset: ability type, role, meta usage in BR and Clash Squad, and verified ability descriptions.",
  path: "/characters",
});

export default async function CharactersPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = normalizeQuery(queryToString(params.q) ?? "");
  const role = queryToString(params.role) ?? null;
  const sort = queryToString(params.sort) ?? "default";

  const all = await getCharacters();

  let filtered = all;
  if (q) {
    const found = await searchGameData(q, { kind: "character", limit: 500 });
    const ids = new Set(found.map((f) => f.id));
    filtered = filtered.filter((c) => ids.has(c.id));
  }
  if (role) filtered = filtered.filter((c) => c.role === role);

  const roles = [...new Set(all.map((c) => c.role).filter(Boolean))] as string[];
  const roleOptions = roles
    .sort()
    .map((r) => ({
      value: r,
      label: titleCase(r),
      count: all.filter((c) => c.role === r).length,
    }));

  filtered = filtered.sort((a, b) =>
    sort === "-name"
      ? b.name.localeCompare(a.name)
      : a.name.localeCompare(b.name),
  );
  if (sort === "skill") {
    filtered = [...filtered].sort((a, b) => {
      const at = a.skillType ?? "";
      const bt = b.skillType ?? "";
      return at.localeCompare(bt) || a.name.localeCompare(b.name);
    });
  }

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(queryToString(params.page) ?? 1) || 1), pageCount);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const query = queryToString(params.q) ?? "";

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={`${all.length} characters in dataset`}
        title="Characters"
        description="Every character record from the imported dataset — ability name, type and description exactly as documented. Meta flags indicate dataset observations for Battle Royale (BR) and Clash Squad (CS), not official ratings."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <FilterSearch
              placeholder="Search by name or ability…"
              className="flex-1 sm:max-w-sm"
            />
          </Suspense>
          <Suspense fallback={<div className="h-9 w-[170px]" />}>
            <SortSelect options={[...SORT_OPTIONS, { value: "role", label: "Role" }]} value={sort} />
          </Suspense>
        </div>
        <Suspense fallback={<div className="h-8" />}>
          <FilterTabs
            basePath="/characters"
            currentParams={params}
            param="role"
            options={roleOptions}
            ariaLabel="Filter characters by role"
          />
        </Suspense>
      </HeadingSection>

      {total === 0 ? (
        <NoResultsState query={query} onResetHref="/characters" />
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground" aria-live="polite">
            Showing {pageItems.length} of {total} character{total === 1 ? "" : "s"}
            {query ? ` matching “${query}”` : ""}
          </p>
          <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {pageItems.map((c) => (
              <CharacterCard key={c.id} character={c} />
            ))}
          </Reveal>
          <Pagination
            basePath="/characters"
            currentParams={params}
            page={page}
            pageCount={pageCount}
          />
        </>
      )}
    </div>
  );
}
