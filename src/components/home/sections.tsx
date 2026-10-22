import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Coins,
  GitCompareArrows,
  Newspaper,
  PawPrint,
  Swords,
  Users,
  Wrench,
  Dices,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { LoadoutCard } from "@/components/game-cards";
import { EmptyState } from "@/components/empty-state";
import { siteConfig } from "@/config/site";
import type { Character, Loadout, Weapon } from "@/types/game";
import { CharacterCard, WeaponCard } from "@/components/game-cards";
import type { Guide } from "@/lib/data";

/* ---------------------------- category explorer --------------------------- */

export type CategoryInfo = {
  href: string;
  label: string;
  description: string;
  icon: typeof Users;
  count: number | null;
  status: string;
};

export function CategoryExplorer({ categories }: { categories: CategoryInfo[] }) {
  return (
    <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const empty = cat.count === 0;
        const comingSoon = cat.count === null;
        return (
          <RevealItem key={cat.href}>
            <Link
              href={cat.href}
              className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg border bg-secondary/60 text-brand">
                  <Icon className="size-4" aria-hidden />
                </span>
                {cat.count !== null ? (
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {cat.count}
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold">{cat.label}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-brand">
                {comingSoon ? (
                  <span className="text-muted-foreground">Preview soon</span>
                ) : (
                  <>
                    {empty ? (
                      <span className="opacity-60">Empty for now</span>
                    ) : (
                      <>
                        Browse <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </>
                    )}
                  </>
                )}
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

/* --------------------------- featured rail shells ------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Reveal className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-eyebrow">{eyebrow}</p>
        <h2 className="text-title mt-1 text-2xl sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline underline-offset-4"
        >
          {linkLabel ?? "View all"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </Reveal>
  );
}

export function FeaturedCharacters({ characters }: { characters: Array<Character | null> }) {
  const present = characters.filter(Boolean) as Character[];
  if (present.length === 0) return null;
  return (
    <section aria-labelledby="featured-characters" className="mt-14">
      <div id="featured-characters" className="scroll-mt-20" />
      <SectionHeading
        eyebrow="Editorial picks"
        title="Featured characters"
        description="A configurable editorial selection — not a ranking. Every card shows real dataset records."
        href="/characters"
      />
      <RevealGroup as="ul" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {present.map((c) => (
          <RevealItem key={c.id} className="h-full">
            <div className="h-full [&>a]:h-full">
              <CharacterCard character={c} />
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function FeaturedWeapons({ weapons }: { weapons: Array<Weapon | null> }) {
  const present = weapons.filter(Boolean) as Weapon[];
  if (present.length === 0) return null;
  return (
    <section aria-labelledby="featured-weapons" className="mt-14">
      <div id="featured-weapons" className="scroll-mt-20" />
      <SectionHeading
        eyebrow="Editorial picks"
        title="Featured weapons"
        description="Visible numbers come straight from the dataset — missing values are never invented."
        href="/weapons"
      />
      <RevealGroup as="ul" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {present.map((w) => (
          <RevealItem key={w.id} className="h-full">
            <div className="h-full [&>a]:h-full">
              <WeaponCard weapon={w} />
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

/* ------------------------------ tools showcase ---------------------------- */

const TOOL_CARDS = [
  {
    href: "/tools/character-compare",
    title: "Character comparison",
    description: "Put abilities side by side and compare what the dataset says — missing values stay visible.",
    icon: GitCompareArrows,
  },
  {
    href: "/tools/weapon-compare",
    title: "Weapon comparison",
    description: "Compare damage, rate of fire, range and more across weapons with shareable URLs.",
    icon: Swords,
  },
  {
    href: "/tools/loadout-builder",
    title: "Loadout builder",
    description: "Assemble a character + pet combination and share it as a link. No fake compatibility rules.",
    icon: Dices,
  },
] as const;

export function ToolShowcase() {
  return (
    <section aria-labelledby="tools" className="mt-14">
      <div id="tools" className="scroll-mt-20" />
      <SectionHeading
        eyebrow="Utilities"
        title="Working tools"
        description="Every tool is real: selections persist in the URL and data comes from the same validated dataset."
        href="/tools"
      />
      <RevealGroup className="grid gap-3 md:grid-cols-3">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          return (
            <RevealItem key={tool.href} className="h-full">
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border bg-secondary/60 text-brand">
                  <Icon className="size-4" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold">{tool.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-brand">
                  Open tool
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}

/* --------------------------- guides & updates ------------------------------ */

export function EditorialSection({
  guides,
  loadouts,
}: {
  guides: Guide[];
  loadouts: Loadout[];
}) {
  return (
    <div className="mt-14 grid gap-6 lg:grid-cols-2" id="editorial">
      <section aria-labelledby="guides-preview">
        <div id="guides-preview" className="scroll-mt-20" />
        <SectionHeading
          eyebrow="Knowledge"
          title="Guides"
          description="Original community guides — structure is ready, content arrives as it is written."
          href="/guides"
        />
        {guides.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-5" aria-hidden />}
            title="No guides published yet"
            description="The guide section is being prepared. Original, clearly attributed guides will appear here — no scraped or misattributed content."
          />
        ) : (
          <ul className="space-y-3">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border bg-card p-4 hover:border-brand/40"
                >
                  <h3 className="font-semibold">{g.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{g.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="loadouts-preview">
        <div id="loadouts-preview" className="scroll-mt-20" />
        <SectionHeading
          eyebrow="Loadout items"
          title="Loadout slots"
          description="Pre-match loadout items and their costs as documented by official patch notes."
          href="/loadouts"
        />
        {loadouts.length === 0 ? (
          <EmptyState
            icon={<Coins className="size-5" aria-hidden />}
            title="Loadout data unavailable"
            description="No loadout records exist in the imported dataset yet."
          />
        ) : (
          <div className="space-y-3">
            {loadouts.slice(0, 3).map((l) => (
              <LoadoutCard key={l.id} loadout={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function UpdatesTeaser() {
  return (
    <section aria-labelledby="updates-preview" className="mt-14">
      <div id="updates-preview" className="scroll-mt-20" />
      <SectionHeading
        eyebrow="Newsroom"
        title="Game updates"
        description="Announcements get published only after curation with an official source link."
        href="/updates"
      />
      <EmptyState
        icon={<Newspaper className="size-5" aria-hidden />}
        title="No curated update posts yet"
        description={
          <>
            This feed has not been populated with curated patch summaries.
            Meanwhile the{" "}
            <a
              className="text-brand underline underline-offset-2 hover:no-underline"
              href={siteConfig.links.officialNews}
              target="_blank"
              rel="noopener noreferrer"
            >
              official Free Fire news page
            </a>{" "}
            lists current announcements.
          </>
        }
      />
    </section>
  );
}

export function ToolkitBanner() {
  return (
    <Reveal className="mt-14">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8">
        <div className="surface-tactical absolute inset-0 opacity-60" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-brand-soft text-brand">
            <Wrench className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-title text-xl">Sensitivity guide &amp; player lookup — planned</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              An editable sensitivity preset sheet and a player-profile lookup shell (requires a permitted API integration later) are scaffolded under Tools.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/70"
          >
            View tools <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export const CATEGORY_ICONS = {
  characters: Users,
  weapons: Swords,
  pets: PawPrint,
  loadouts: Coins,
  guides: BookOpen,
  updates: Newspaper,
  tools: Wrench,
} as const;
