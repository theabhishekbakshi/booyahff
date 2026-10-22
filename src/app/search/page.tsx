import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search, Users, Swords, PawPrint, Package } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { EmptyState } from "@/components/empty-state";
import { HeadingSection } from "@/components/heading-section";
import { Heading } from "@/components/typography";
import { getSearchIndex, normalizeQuery } from "@/lib/data";
import { queryToString } from "@/lib/query";
import { pageMetadata } from "@/lib/seo";

const KINDS = [
  { key: "character", label: "Characters", icon: Users },
  { key: "weapon", label: "Weapons", icon: Swords },
  { key: "pet", label: "Pets", icon: PawPrint },
  { key: "loadout", label: "Loadouts", icon: Package },
] as const;


// searchParams-driven route: blocks until the query resolves so status codes
// stay exact for every request combination
export const instant = false;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = queryToString(params.q) ?? "";
  return pageMetadata({
    title: q ? `Search: “${q}”` : "Search",
    description: "Search results across characters, weapons, pets and loadout items.",
    path: "/search",
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<div className="container-page py-10"><div className="h-40" /></div>}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = queryToString(params.q) ?? "";
  const index = await getSearchIndex();
  const mine = q ? filterIndex(index, normalizeQuery(q)) : [];
  const grouped = KINDS.map((k) => ({ ...k, items: mine.filter((i) => i.kind === k.key) }));

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={q ? `${mine.length} results` : "Search"}
        title={q ? `Results for “${q}”` : "Search the database"}
        description={q ? undefined : "Use the header search (press /) or the box below — matching covers names, abilities and types."}
      >
        <form action="/search" className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search characters, weapons, pets…"
            aria-label="Search"
            className="h-11 w-full rounded-lg border bg-card pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand/50"
          />
        </form>
      </HeadingSection>

      {q && mine.length === 0 ? (
        <NoMatches q={q} />
      ) : (
        <div className="grid gap-8">
          {grouped
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <section key={group.key} aria-label={group.label} id={group.key}>
                <Heading level={2}>
                  <group.icon className="mr-1.5 inline size-4 text-brand" aria-hidden />
                  {group.label}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{group.items.length}</span>
                </Heading>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {group.items.map((item) => (
                    <ResultCard key={item.href} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

type IndexEntry = Awaited<ReturnType<typeof getSearchIndex>>[number];

function filterIndex(index: IndexEntry[], q: string): IndexEntry[] {
  if (!q) return [];
  return index.filter((entry) => {
    const title = entry.title.toLowerCase();
    const subtitle = (entry.subtitle ?? "").toLowerCase();
    const snippet = (entry.snippet ?? "").toLowerCase();
    return title.includes(q) || subtitle.includes(q) || snippet.includes(q) || entry.keywords.includes(q);
  });
}

function ResultCard({ item }: { item: IndexEntry }) {
  const kindLabel = item.kind.charAt(0).toUpperCase() + item.kind.slice(1);
  return (
    <Link
      href={item.href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
    >
      <div className="surface-tactical relative flex aspect-[4/3] items-center justify-center border-b bg-gradient-to-b from-secondary/40 to-transparent">
        <GameImage name={item.title} assetPath={item.image} size={150} className="size-full" />
        <span className="absolute left-2.5 top-2.5 rounded-md border bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {kindLabel}
        </span>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold">{item.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{item.subtitle ?? ""}</p>
      </div>
    </Link>
  );
}

function NoMatches({ q }: { q: string }) {
  return (
    <EmptyState
      icon={<Search className="size-5" aria-hidden />}
      title={`No matches for “${q}”`}
      description="The search covers record titles, ability names and types in the imported dataset. Character counter advice may still mention the term — browse counters from character pages."
      action={
        <Link href="/characters" className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/70">
          Browse all characters
        </Link>
      }
    />
  );
}
