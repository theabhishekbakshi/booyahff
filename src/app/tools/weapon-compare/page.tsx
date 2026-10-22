import type { Metadata } from "next";
import { Suspense } from "react";
import { HeadingSection } from "@/components/heading-section";
import { WeaponComparisonClient } from "@/features/tools/weapon-compare-client";
import { getWeapons } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Weapon comparison",
  description:
    "Compare Free Fire weapon stats side by side: damage, rate of fire, range, magazine size and store prices, with dataset provenance.",
  path: "/tools/weapon-compare",
});

export default async function WeaponComparePage() {
  const weapons = await getWeapons();

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Tool"
        title="Weapon comparison"
        description={
          <>
            Compare up to four weapons. Missing values are shown explicitly — a blank stat is never
            treated as zero, and no overall winner is declared when data has gaps.
          </>
        }
      />
      <Suspense fallback={<div className="h-24" />}>
        <WeaponComparisonClient
          records={weapons.map((w) => ({
            id: w.id,
            name: w.name,
            subtitle: w.primaryType ?? w.type ?? null,
            keywords: `${w.type ?? ""} ${(w.aliases ?? []).join(" ")}`,
            image: w.imageLocal,
            type: w.type,
            damage: w.damage,
            rateOfFire: w.rateOfFire,
            range: w.range,
            magazineSize: w.magazineSize,
            price: w.price,
            armory: w.armory,
            clashSquad: w.availableInClashSquad,
            specialAttributes: w.specialAttributes,
            lastVerified: w.lastVerified,
          }))}
        />
      </Suspense>
    </div>
  );
}
