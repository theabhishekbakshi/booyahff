import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Swords,
  Target,
  ShieldAlert,
  Zap,
  Users2,
  GitCompareArrows,
} from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProvenanceInfo } from "@/components/provenance-info";
import { Reveal } from "@/components/reveal";
import { CharacterCard } from "@/components/game-cards";
import { getCharacterById, getCharacterCounters, getCharacters } from "@/lib/data";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { titleCase } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

// blocking route: params resolve before the shell flushes, so unlisted slugs emit a real HTTP 404
export const instant = false;


export async function generateStaticParams() {
  const characters = await getCharacters();
  return characters.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const character = await getCharacterById(slug);
  if (!character) return pageMetadata({ title: "Character not found", description: "This character does not exist in the dataset.", path: `/characters/${slug}`, noIndex: true });
  return pageMetadata({
    title: `${character.name} — ability, role & data`,
    description: `${character.name}${character.skill ? ` (${character.skill})` : ""}: verified ability description, role and dataset provenance.`,
    path: `/characters/${character.id}`,
  });
}

export default async function CharacterPage({ params }: Params) {
  const { slug } = await params;
  const character = await getCharacterById(slug);
  if (!character) notFound();

  const [{ profile, mentionedBy }] = await Promise.all([
    getCharacterCounters(character.id),
  ]);
  const all = await getCharacters();
  // related = same role (neutral, data-derived relation)
  const related =
    character.role
      ? all.filter((c) => c.role === character.role && c.id !== character.id).slice(0, 6)
      : [];

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
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Characters", href: "/characters" },
          { name: character.name, href: `/characters/${character.id}` },
        ]}
      />

      <Reveal className="mt-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="surface-tactical absolute inset-0 opacity-70" aria-hidden />
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,260px)_1fr]">
            {/* portrait */}
            <div className="relative mx-auto w-full max-w-64 md:mx-0 md:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border bg-gradient-to-b from-secondary/50 to-transparent p-3 pb-0 sm:p-4 sm:pb-0">
                <GameImage
                  name={character.name}
                  assetPath={character.imageLocal}
                  size={360}
                  contain
                  className="mx-auto size-full"
                  priority
                />
              </div>
              {character.changeStatus ? (
                <Badge className="absolute right-2 top-2 border-brand/50 bg-brand-soft font-mono text-[10px] uppercase tracking-wider">
                  {character.changeStatus}
                </Badge>
              ) : null}
            </div>

            {/* title + ability */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {character.role ? (
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                    <Target className="mr-1 size-3" aria-hidden />
                    {titleCase(character.role)}
                  </Badge>
                ) : null}
                {character.metaBr !== null && (character.metaBr ? <Badge className="border-success/40 bg-success/10 text-success">BR meta</Badge> : <Badge variant="outline">BR not meta</Badge>)}
                {character.metaCs !== null && (character.metaCs ? <Badge className="border-success/40 bg-success/10 text-success">CS meta</Badge> : <Badge variant="outline">CS not meta</Badge>)}
                {character.patchVersion ? (
                  <Badge variant="outline" className="font-mono text-[10px]">{character.patchVersion}</Badge>
                ) : null}
              </div>
              <h1 className="text-title mt-3 text-4xl leading-tight">{character.name}</h1>

              <section aria-labelledby="ability" className="mt-5">
                <p className="text-eyebrow">Ability</p>
                <h2 id="ability" className="mt-1 flex items-center gap-2 text-xl font-semibold">
                  <Zap className="size-4 text-brand" aria-hidden />
                  {character.skill ?? "Not available in dataset"}
                  {character.skillType ? (
                    <span className="rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {character.skillType}
                    </span>
                  ) : null}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {character.description ?? "Ability description not provided by the dataset."}
                </p>
              </section>

              {character.skillBoosts.length > 0 ? (
                <section aria-label="Skill boosts" className="mt-5 rounded-lg border bg-muted/30 p-4">
                  <p className="text-eyebrow">Skill boosts</p>
                  <ul className="mt-2 space-y-2.5">
                    {character.skillBoosts.map((b, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-semibold">{b.name}</span>
                        {b.effect ? <span className="text-muted-foreground"> — {b.effect}</span> : null}
                        {b.csRead ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Clash Squad note: {b.csRead}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {character.csPerkNote ? (
                    <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">{character.csPerkNote}</p>
                  ) : null}
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      {/* analysis + provenance */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {character.csAnalysis ? (
            <Reveal as="section" aria-label="Clash Squad analysis">
              <div className="rounded-xl border bg-card p-5">
                <h2 className="text-title flex items-center gap-2 text-lg">
                  <Swords className="size-4 text-brand" aria-hidden /> Clash Squad analysis
                  <Badge variant="outline" className="ml-auto font-mono text-[10px]">
                    dataset observation
                  </Badge>
                </h2>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {character.csAnalysis.archetype ? (
                    <div>
                      <dt className="text-eyebrow">Archetype</dt>
                      <dd className="mt-0.5">{character.csAnalysis.archetype}</dd>
                    </div>
                  ) : null}
                  {character.csAnalysis.priority ? (
                    <div>
                      <dt className="text-eyebrow">CS priority</dt>
                      <dd className="mt-0.5">{titleCase(character.csAnalysis.priority)}</dd>
                    </div>
                  ) : null}
                  {character.csAnalysis.bestUse ? (
                    <div>
                      <dt className="text-eyebrow">Best use</dt>
                      <dd className="mt-0.5 leading-relaxed text-muted-foreground">{character.csAnalysis.bestUse}</dd>
                    </div>
                  ) : null}
                  {character.csAnalysis.counterFocus ? (
                    <div>
                      <dt className="text-eyebrow">Counter focus</dt>
                      <dd className="mt-0.5 leading-relaxed text-muted-foreground">{character.csAnalysis.counterFocus}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </Reveal>
          ) : null}

          {/* counters */}
          <Reveal as="section" aria-label="Counter information">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-title flex items-center gap-2 text-lg">
                <ShieldAlert className="size-4 text-brand" aria-hidden /> Counter information
                {profile ? (
                  <Link
                    href={`/characters/${character.id}/counters`}
                    className="ml-auto text-xs font-medium text-brand hover:underline underline-offset-4"
                  >
                    Expand all matchups →
                  </Link>
                ) : null}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Matchup direction comes from the imported counter dataset — third-party analysis, not official data.
              </p>
              {profile && profile.counters.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold">
                    Countered by (community analysis) — <span className="text-muted-foreground font-normal">{profile.counterCategory ?? "category unavailable"}</span>
                  </p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {profile.counters.slice(0, 3).map((k, i) => (
                      <CounterTeaser key={i} name={k.name} skill={k.skill} reason={k.reason} href={k.characterId ? `/characters/${k.characterId}` : null} />
                    ))}
                  </ul>
                  {(mentionedBy.length > 0 || profile.counters.length > 3) && (
                    <Link href={`/characters/${character.id}/counters`} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline underline-offset-4">
                      <GitCompareArrows className="size-3.5" aria-hidden /> See all counters and mentions
                    </Link>
                  )}
                </div>
              ) : mentionedBy.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold">Mentioned as a counter for:</p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {mentionedBy.slice(0, 3).map((m, i) => (
                      <CounterTeaser
                        key={i}
                        name={m.name}
                        skill={m.skill}
                        reason={m.reason}
                        href={`/characters/${m.characterId}`}
                        prefix="vs"
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No counter relationships for this character appear in the imported dataset.
                </p>
              )}
            </div>
          </Reveal>

          {related.length > 0 ? (
            <section aria-label="Related characters">
              <h2 className="text-title mb-3 flex items-center gap-2 text-lg">
                <Users2 className="size-4 text-brand" aria-hidden />
                Related {titleCase(character.role)} characters
              </h2>
              <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {related.map((c) => (
                  <CharacterCard key={c.id} character={c} />
                ))}
              </Reveal>
            </section>
          ) : null}
        </div>

        {/* provenance sidebar */}
        <aside className="space-y-4">
          <ProvenanceInfo
            confidenceLabel={character.dataConfidence}
            lastVerified={character.lastReviewed}
            patchVersion={character.patchVersion}
            sources={character.sources}
            notes={
              character.apiId
                ? [`Dataset api_id: ${character.apiId}`]
                : undefined
            }
          />
        </aside>
      </div>
    </div>
  );
}

function CounterTeaser({
  name,
  skill,
  reason,
  href,
  prefix,
}: {
  name: string | null;
  skill: string | null;
  reason: string | null;
  href: string | null;
  prefix?: string;
}) {
  const content = (
    <div className="rounded-lg border bg-secondary/30 p-3 text-xs transition-colors hover:border-brand/40">
      <p className="font-semibold">
        {prefix && <span className="font-mono text-[10px] text-muted-foreground">{prefix} </span>}
        {name ?? "Unknown"}
      </p>
      {skill ? <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{skill}</p> : null}
      {reason ? <p className="mt-1 leading-relaxed text-muted-foreground">{reason}</p> : null}
    </div>
  );
  return href ? <Link href={href} className="min-w-0">{content}</Link> : content;
}
