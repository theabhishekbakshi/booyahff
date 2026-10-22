import type { Metadata } from "next";
import { LoadoutCard } from "@/components/game-cards";
import { EmptyState } from "@/components/empty-state";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { getLoadouts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Loadout items",
  description:
    "Pre-match loadout items: Enhance Hammer, Tactical Market, Team Booster and Super Leg Pocket — documented effects and costs from official patch notes.",
  path: "/loadouts",
});

export default async function LoadoutsPage() {
  const loadouts = await getLoadouts();

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={`${loadouts.length} loadout items in dataset`}
        title="Loadout items"
        description={
          <>
            In Free Fire a &ldquo;loadout&rdquo; is a pre-match item slot — like the Tactical Market
            or Enhance Hammer — not a character build. This page documents what each loadout item
            does in Battle Royale (BR) and Clash Squad (CS), including documented price history from patch notes.
          </>
        }
      />

      {loadouts.length === 0 ? (
        <EmptyState
          title="No loadout records"
          description="The imported dataset does not contain loadout-preview records yet."
        />
      ) : (
        <Reveal className="grid gap-3 md:grid-cols-2">
          {loadouts.map((l) => (
            <LoadoutCard key={l.id} loadout={l} />
          ))}
        </Reveal>
      )}
    </div>
  );
}
