import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CircleDollarSign, Store, Info, Crosshair } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProvenanceInfo } from "@/components/provenance-info";
import { Reveal } from "@/components/reveal";
import { WeaponCard } from "@/components/game-cards";
import { StatBar } from "@/components/stat-bar";
import { getWeaponById, getWeapons } from "@/lib/data";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// blocking route: params resolve before the shell flushes, so unlisted slugs emit a real HTTP 404
export const instant = false;


export async function generateStaticParams() {
  const weapons = await getWeapons();
  return weapons.map((w) => ({ slug: w.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const weapon = await getWeaponById(slug);
  if (!weapon)
    return pageMetadata({ title: "Weapon not found", description: "This weapon does not exist in the dataset.", path: `/weapons/${slug}`, noIndex: true });
  return pageMetadata({
    title: `${weapon.name} — ${weapon.type ?? "weapon"} stats`,
    description: weapon.description ? `${weapon.name}: ${weapon.description.slice(0, 150)}` : `${weapon.name} stats and dataset provenance.`,
    path: `/weapons/${weapon.id}`,
  });
}

export default async function WeaponDetailPage({ params }: Params) {
  const { slug } = await params;
  const weapon = await getWeaponById(slug);
  if (!weapon) notFound();

  const all = await getWeapons();
  // related = same primary type from the dataset itself
  const related = all
    .filter((w) => w.primaryType === weapon.primaryType && w.id !== weapon.id)
    .slice(0, 6);

  const currency =
    weapon.armory && /CS|Competitive/.test(weapon.armory) ? "CS Cash" : null;

  return (
    <div className="container-page py-8 sm:py-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "Weapons", href: "/weapons" },
              { name: weapon.name, href: `/weapons/${weapon.id}` },
            ]),
          ),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Weapons", href: "/weapons" },
          { name: weapon.name, href: `/weapons/${weapon.id}` },
        ]}
      />

      <Reveal className="mt-6">
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          <div className="surface-tactical absolute inset-0 opacity-70" aria-hidden />
          <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,340px)_1fr]">
            <div className="relative aspect-[16/11] self-start overflow-hidden rounded-xl border bg-gradient-to-b from-secondary/50 to-transparent">
              <GameImage
                name={weapon.name}
                assetPath={weapon.imageLocal}
                size={460}
                className="size-full p-2"
                priority
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
                  {weapon.type ?? "Weapon"}
                </Badge>
                {weapon.availableInClashSquad === true && <Badge variant="outline">Clash Squad</Badge>}
                {weapon.lastVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BadgeCheck className="size-3.5 text-success" aria-hidden />
                    verified {weapon.lastVerified}
                  </span>
                )}
              </div>
              <h1 className="text-title mt-3 text-4xl leading-tight">{weapon.name}</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {weapon.description ?? "Description not available in the dataset."}
              </p>

              {/* store econ facts (only when present) */}
              <div className="mt-4 flex flex-wrap gap-2">
                {weapon.price !== null ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary/40 px-3 py-1.5 text-sm">
                    <CircleDollarSign className="size-4 text-brand" aria-hidden />
                    {weapon.price}
                    {currency ? <span className="text-muted-foreground">{currency}</span> : null}
                  </span>
                ) : null}
                {weapon.armory ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary/40 px-3 py-1.5 text-sm">
                    <Store className="size-4 text-brand" aria-hidden />
                    {weapon.armory}
                  </span>
                ) : null}
                {weapon.magazineSize !== null ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border bg-secondary/40 px-3 py-1.5 text-sm">
                    <Crosshair className="size-4 text-brand" aria-hidden />
                    {weapon.magazineSize} rounds
                  </span>
                ) : null}
              </div>

              {/* stat bars — hidden when the dataset lacks the number */}
              <section aria-label="Weapon statistics" className="mt-6 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                <StatBar label="Damage" value={weapon.damage} />
                <StatBar label="Rate of fire" value={weapon.rateOfFire} />
                <StatBar label="Range" value={weapon.range} />
                <StatBar label="Magazine" value={weapon.magazineSize} max={120} suffix={" rounds"} />
              </section>
              {(weapon.rateOfFire === null || weapon.range === null) && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  Not every stat is recorded for every weapon in the imported dataset; bars are shown only for present values.
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {weapon.specialAttributes.length > 0 ? (
            <Reveal as="section" aria-label="Special attributes">
              <div className="rounded-xl border bg-card p-5">
                <h2 className="text-title text-lg">Special attributes</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {weapon.specialAttributes.map((attr) => (
                    <li
                      key={attr}
                      className="rounded-lg border bg-secondary/40 px-3 py-1.5 text-sm"
                    >
                      {attr}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ) : null}

          {(weapon.attachments.length > 0 || weapon.recentUpdates.length > 0) && (
            <Reveal as="section" aria-label="Patch notes and attachments">
              <div className="rounded-xl border bg-card p-5">
                {weapon.recentUpdates.length > 0 ? (
                  <>
                    <h2 className="text-title text-lg">Recent dataset notes</h2>
                    <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
                      {weapon.recentUpdates.map((u) => (
                        <li key={u}>{u}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {weapon.attachments.length > 0 ? (
                  <>
                    <h2 className="text-title mt-4 text-lg">Documented attachments</h2>
                    <p className="mt-2 font-mono text-xs text-muted-foreground">
                      {weapon.attachments.join(" · ")}
                    </p>
                  </>
                ) : null}
              </div>
            </Reveal>
          )}

          {related.length > 0 ? (
            <section aria-label={`Related ${weapon.primaryType} weapons`}>
              <h2 className="text-title mb-3 text-lg">More {weapon.primaryType} weapons</h2>
              <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {related.map((w) => (
                  <WeaponCard key={w.id} weapon={w} />
                ))}
              </Reveal>
            </section>
          ) : null}
        </div>

        <aside>
          <ProvenanceInfo
            confidenceLabel={weapon.dataConfidence}
            lastVerified={weapon.lastVerified}
            patchVersion={null}
            sources={weapon.sources}
            notes={weapon.sourceNotes.length > 0 ? weapon.sourceNotes : undefined}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Stat comparisons belong in the{" "}
            <Link href="/tools/weapon-compare" className="text-brand hover:underline underline-offset-2">
              weapon comparison tool
            </Link>
            .
          </p>
        </aside>
      </div>
    </div>
  );
}
