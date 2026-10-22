import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, Hammer, ShoppingBag, Users, History } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProvenanceInfo } from "@/components/provenance-info";
import { Reveal } from "@/components/reveal";
import { getLoadoutById, getLoadouts } from "@/lib/data";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// blocking route: params resolve before the shell flushes, so unlisted slugs emit a real HTTP 404
export const instant = false;


export async function generateStaticParams() {
  const loadouts = await getLoadouts();
  return loadouts.map((l) => ({ slug: l.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const loadout = await getLoadoutById(slug);
  if (!loadout)
    return pageMetadata({ title: "Loadout not found", description: "This loadout item does not exist in the dataset.", path: `/loadouts/${slug}`, noIndex: true });
  return pageMetadata({
    title: `${loadout.name ?? loadout.id} — loadout item`,
    description:
      loadout.shortDescription ??
      loadout.descriptionBr?.slice(0, 150) ??
      "Loadout item effects and costs as documented.",
    path: `/loadouts/${loadout.id}`,
  });
}

function CostBlock({
  currency,
  items,
  note,
  title,
}: {
  currency: string | null;
  items: Array<{ id?: string | null; name?: string | null; cost?: number | null; previousCost?: number | null; changedIn?: string | null; usage?: string | null; cooldown?: string | null; earnRule?: string | null }>;
  note: string | null;
  title: string;
}) {
  return (
    <section aria-label={title} className="rounded-xl border bg-card p-5">
      <h3 className="text-title flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        <Coins className="size-3.5 text-brand" aria-hidden /> {title}
        {currency ? <Badge variant="outline" className="font-mono text-[10px]">{currency}</Badge> : null}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-3 divide-y">
          {items.map((item, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0">
              <span className="font-medium">{item.name ?? item.id}</span>
              <span className="text-right font-mono text-xs tabular-nums">
                {item.cost !== null ? String(item.cost) : "Not available"}
                {item.previousCost !== null && item.previousCost !== undefined && item.changedIn ? (
                  <span className="ml-1.5 text-muted-foreground">
                    (was {item.previousCost} · {item.changedIn})
                  </span>
                ) : null}
                {item.usage ? <span className="ml-1.5 text-muted-foreground">· {item.usage}</span> : null}
                {item.cooldown ? <span className="ml-1.5 text-muted-foreground">· {item.cooldown}</span> : null}
                {item.earnRule ? <span className="ml-1.5 text-muted-foreground">· {item.earnRule}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : note ? (
        <p className="mt-3 text-sm text-muted-foreground">{note}</p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No cost entries recorded.</p>
      )}
    </section>
  );
}

export default async function LoadoutDetailPage({ params }: Params) {
  const { slug } = await params;
  const loadout = await getLoadoutById(slug);
  if (!loadout) notFound();

  const all = await getLoadouts();
  const others = all.filter((l) => l.id !== loadout.id);

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "Loadouts", href: "/loadouts" },
              { name: loadout.name ?? loadout.id, href: `/loadouts/${loadout.id}` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Loadouts", href: "/loadouts" },
          { name: loadout.name ?? loadout.id, href: `/loadouts/${loadout.id}` },
        ]}
      />

      <Reveal className="mt-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="surface-tactical absolute inset-0 opacity-70" aria-hidden />
          <div className="relative flex flex-wrap items-center gap-6 p-6 sm:p-8">
            <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border bg-gradient-to-b from-secondary/50 to-transparent sm:size-36">
              <GameImage name={loadout.name ?? loadout.id} assetPath={loadout.imageLocal} size={220} className="size-full" priority />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                  {loadout.category ?? "Loadout"}
                </Badge>
              </div>
              <h1 className="text-title mt-2 text-3xl leading-tight sm:text-4xl">
                {loadout.name ?? loadout.id}
              </h1>
              {loadout.tagline ? (
                <p className="mt-1 text-sm italic text-muted-foreground">“{loadout.tagline}”</p>
              ) : null}
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {loadout.shortDescription ?? ""}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Reveal as="section" aria-label="Mode descriptions">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-title text-lg">Effects by mode</h2>
              {loadout.descriptionBr ? (
                <div className="mt-3">
                  <h3 className="text-eyebrow">Battle Royale (BR)</h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {loadout.descriptionBr}
                  </p>
                </div>
              ) : null}
              {loadout.descriptionCs ? (
                <div className="mt-4">
                  <h3 className="text-eyebrow">Clash Squad (CS)</h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {loadout.descriptionCs}
                  </p>
                </div>
              ) : null}
            </div>
          </Reveal>

          {(loadout.gadgets.length > 0 || loadout.boosters.length > 0) ? (
            <Reveal as="section" aria-label="Gadgets and boosters">
              <div className="rounded-xl border bg-card p-5">
                <h2 className="text-title flex items-center gap-2 text-lg">
                  <ShoppingBag className="size-4 text-brand" aria-hidden /> Gadgets &amp; boosters
                </h2>
                {loadout.gadgets.length > 0 ? (
                  <ul className="mt-3 space-y-3">
                    {loadout.gadgets.map((g, i) => (
                      <li key={i} className="rounded-lg border bg-secondary/30 p-3 text-sm">
                        <p className="font-semibold">
                          {g.name} {g.rarity ? <Badge variant="outline" className="ml-1 text-[10px]">{g.rarity}</Badge> : null}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {g.descriptionBr ?? ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {loadout.boosters.length > 0 ? (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {loadout.boosters.map((b, i) => (
                      <li key={i} className="rounded-lg border bg-secondary/30 p-3 text-sm">
                        <p className="font-semibold">
                          {b.name} {b.rarity ? <Badge variant="outline" className="ml-1 text-[10px]">{b.rarity}</Badge> : null}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {b.effect?.br ?? "Effect description not recorded."}
                        </p>
                        {b.effect?.cs ? (
                          <p className="mt-1 text-xs text-muted-foreground">CS: {b.effect.cs}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {(loadout.cost?.br || loadout.cost?.cs) ? (
            <Reveal as="section" aria-label="Costs">
              <div className="grid gap-4 sm:grid-cols-2">
                {loadout.cost.br ? (
                  <CostBlock
                    title="Battle Royale cost"
                    currency={loadout.cost.br.currency}
                    items={loadout.cost.br.items}
                    note={loadout.cost.br.note}
                  />
                ) : null}
                {loadout.cost.cs ? (
                  <CostBlock
                    title="Clash Squad cost"
                    currency={loadout.cost.cs.currency}
                    items={loadout.cost.cs.items}
                    note={loadout.cost.cs.note}
                  />
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {loadout.patchHistory.length > 0 ? (
            <Reveal as="section" aria-label="Patch history">
              <div className="rounded-xl border bg-card p-5">
                <h2 className="text-title flex items-center gap-2 text-lg">
                  <History className="size-4 text-brand" aria-hidden /> Patch history
                </h2>
                <ol className="relative mt-3 space-y-3 border-l pl-4">
                  {loadout.patchHistory.map((h, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-card bg-brand" aria-hidden />
                      <p className="font-mono text-xs font-semibold">{h.version}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{h.change}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          ) : null}

          {others.length > 0 ? (
            <section aria-label="Other loadout items">
              <h2 className="text-title mb-3 flex items-center gap-2 text-lg">
                <Hammer className="size-4 text-brand" aria-hidden /> Other loadout items
              </h2>
              <ul className="space-y-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/loadouts/${o.id}`}
                      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm transition-colors hover:border-brand/40"
                    >
                      <span className="font-medium">{o.name ?? o.id}</span>
                      <span className="text-xs text-muted-foreground">{o.category ?? "Loadout"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside>
          <ProvenanceInfo
            confidenceLabel={null}
            lastVerified={null}
            patchVersion={null}
            sources={[]}
            notes={[
              "Effects and costs transcribed from official patch notes by the upstream dataset.",
              "Descriptions show the current documented state plus historical notes.",
            ]}
          />
          <p className="mt-3 flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Users className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Loadout items are team-wide tools — they do not change character abilities.
          </p>
        </aside>
      </div>
    </div>
  );
}
