import Link from "next/link";
import { ArrowLeft, Crosshair, ShieldPlus, ShieldX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { HeadingSection } from "@/components/heading-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";
import { GameImage } from "@/components/game-image";
import { notFound } from "next/navigation";
import { getCharacterById, getCharacterCounters } from "@/lib/data";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { titleCase } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

// blocking route: params resolve before the shell flushes, so unlisted slugs emit a real HTTP 404
export const instant = false;


export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const character = await getCharacterById(slug);
  if (!character)
    return pageMetadata({ title: "Character not found", description: "This character is not in the dataset.", path: `/characters/${slug}/counters`, noIndex: true });
  return pageMetadata({
    title: `${character.name} — counters`,
    description: `Which characters counter ${character.name} and which matchups ${character.name} answers, according to the imported community counter dataset.`,
    path: `/characters/${character.id}/counters`,
  });
}

export default async function CountersPage({ params }: Params) {
  const { slug } = await params;
  const character = await getCharacterById(slug);
  if (!character) notFound();
  const { profile, mentionedBy } = await getCharacterCounters(character.id);

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "Characters", href: "/characters" },
              { name: character.name, href: `/characters/${character.id}` },
              { name: "Counters", href: `/characters/${character.id}/counters` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Characters", href: "/characters" },
          { name: character.name, href: `/characters/${character.id}` },
          { name: "Counters", href: `/characters/${character.id}/counters` },
        ]}
      />

      <HeadingSection
        eyebrow="Counter dataset (community analysis)"
        title={`${character.name} matchups`}
        description={
          <>
            Relationships below are imported from the public counter dataset — third-party
            community analysis, not official game data and not a universal ranking.
            {profile?.counterCategory ? ` Category: ${profile.counterCategory}.` : ""}
          </>
        }
      >
        <Link
          href={`/characters/${character.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline underline-offset-4"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back to character
        </Link>
      </HeadingSection>

      {profile ? (
        <Reveal as="section" aria-label="This character is countered by">
          <div className="relative mb-8 overflow-hidden rounded-xl border bg-card">
            <div className="surface-tactical absolute inset-0 opacity-60" aria-hidden />
            <div className="relative flex items-center gap-4 p-5">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-secondary/40">
                <GameImage name={character.name} assetPath={character.imageLocal} size={96} className="size-full" />
              </div>
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 font-semibold">
                  <ShieldX className="size-4 text-destructive" aria-hidden />
                  Countered by these picks
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {profile.skill ? `${profile.skill} · ` : ""}
                  {titleCase(profile.role ?? "")} · {character.name}
                </p>
              </div>
            </div>
            {profile.counters.length > 0 ? (
              <ul className="relative border-t">
                {profile.counters.map((k, i) => (
                  <li key={i}>
                    <CounterRow
                      href={k.characterId ? `/characters/${k.characterId}` : null}
                      name={k.name}
                      skill={k.skill}
                      reason={k.reason}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="relative p-5 text-sm text-muted-foreground">No counter entries listed.</p>
            )}
          </div>
        </Reveal>
      ) : (
        <EmptyState
          className="mb-8"
          title="No counter profile for this character"
          description="The imported counter dataset does not include a profile where this character is the subject. The dataset is partial — absence here does not mean a matchup does not exist in game."
        />
      )}

      {mentionedBy.length > 0 ? (
        <Reveal as="section" aria-label="This character counters">
          <h2 className="text-title flex items-center gap-2 text-lg">
            <ShieldPlus className="size-4 text-success" aria-hidden />
            {character.name} counters these characters
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            These are profiles from the counter dataset where {character.name} is listed as their counter.
          </p>
          <ul className="mt-4 border-t">
            {mentionedBy.map((m, i) => (
              <li key={i}>
                <CounterRow
                  href={`/characters/${m.characterId}`}
                  name={m.name}
                  skill={m.skill}
                  reason={m.reason}
                  prefix="counters"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      {!profile && mentionedBy.length === 0 ? (
        <EmptyState
          icon={<Crosshair className="size-5" aria-hidden />}
          title="No matchup relationships found"
          description="Neither as subject nor as listed counter — no records in the imported dataset mention this character. The dataset covers only a subset of characters."
        />
      ) : null}

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        Reminder: counter information reflects specific playstyles and modes. Treat any matchup as situational advice rather than a rule.
      </p>
    </div>
  );
}

function CounterRow({
  href,
  name,
  skill,
  reason,
  prefix,
}: {
  href: string | null;
  name: string | null;
  skill: string | null;
  reason: string | null;
  prefix?: string;
}) {
  const inner = (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40">
      {/*
        Skipping images in rows keeps the list lightweight. Hook:
        <GameImage name={name ?? ""} assetPath={...} />
      */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {prefix && <span className="font-mono text-[10px] uppercase tracking-wider text-brand">{prefix}</span>}
          {" "}{name ?? "Unknown"}{skill ? <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground">{titleCase(skill)}</span> : null}
        </p>
        {reason ? <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{reason}</p> : null}
      </div>
      {href ? (
        <span className="text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
          View
        </span>
      ) : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
