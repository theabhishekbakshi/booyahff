import type { Metadata } from "next";
import { Suspense } from "react";
import { HeadingSection } from "@/components/heading-section";
import { LoadoutBuilderClient } from "@/features/tools/loadout-builder-client";
import { getCharacters, getPets } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Loadout builder",
  description:
    "Compose a Free Fire squad from the dataset: choose up to three characters and one pet, then share the exact composition as a link.",
  path: "/tools/loadout-builder",
});

export default async function LoadoutBuilderPage() {
  const [characters, pets] = await Promise.all([getCharacters(), getPets()]);

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Tool"
        title="Loadout builder"
        description="Assemble a squad exactly from dataset records: three characters and one pet. The summary panel documents abilities without inventing compatibility rules."
      />
      <Suspense fallback={<div className="h-40" />}>
        <LoadoutBuilderClient
          characters={characters.map((c) => ({
            id: c.id,
            name: c.name,
            image: c.imageLocal,
            skill: c.skill,
            skillType: c.skillType,
            role: c.role,
            metaBr: c.metaBr,
            metaCs: c.metaCs,
          }))}
          pets={pets.map((p) => ({
            id: p.id,
            name: p.name,
            image: p.imageLocal,
            skill: p.skill,
            role: p.role,
          }))}
        />
      </Suspense>
    </div>
  );
}
