import type { Metadata } from "next";
import { HeadingSection } from "@/components/heading-section";
import { Suspense } from "react";
import { CharacterComparisonClient } from "@/features/tools/character-compare-client";
import { getCharacters } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Character comparison",
  description:
    "Compare Free Fire characters side by side: ability type, role, meta flags and Clash Squad notes from the imported dataset.",
  path: "/tools/character-compare",
});

export default async function CharacterComparePage() {
  const characters = await getCharacters();

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Tool"
        title="Character comparison"
        description="Pick two or three characters to see their dataset attributes side by side. This tool compares only what the dataset records — there are no invented ability stats."
      />
      <Suspense fallback={<div className="h-24" />}>
        <CharacterComparisonClient
          records={characters.map((c) => ({
            id: c.id,
            name: c.name,
            subtitle: [c.skillType, c.role].filter(Boolean).join(" · ") || null,
            keywords: `${c.skill ?? ""} ${c.role ?? ""}`,
            image: c.imageLocal,
            skill: c.skill,
            skillType: c.skillType,
            role: c.role,
            changeStatus: c.changeStatus,
            metaBr: c.metaBr,
            metaCs: c.metaCs,
            patchVersion: c.patchVersion,
            boosts: c.skillBoosts.map((b) => b.name).filter(Boolean) as string[],
            archetype: c.csAnalysis?.archetype ?? null,
            priority: c.csAnalysis?.priority ?? null,
          }))}
        />
      </Suspense>
    </div>
  );
}
