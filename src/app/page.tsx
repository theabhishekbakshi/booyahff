import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ScrollProgress } from "@/components/scroll-progress";
import {
  CATEGORY_ICONS,
  CategoryExplorer,
  EditorialSection,
  FeaturedCharacters,
  FeaturedWeapons,
  ToolShowcase,
  ToolkitBanner,
  UpdatesTeaser,
} from "@/components/home/sections";
import { HeadingSection } from "@/components/heading-section";
import {
  getCharacterById,
  getCharacters,
  getLoadouts,
  getPets,
  getGuides,
  getWeaponById,
  getWeapons,
} from "@/lib/data";
import { getOfficialNews } from "@/lib/official";
import { OfficialFeedSections } from "@/components/home/official-feed";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: siteConfig.tagline,
  description:
    "Unofficial Free Fire database — explore characters, weapons, pets and loadout items with provenance, comparisons and search. Not affiliated with Garena.",
  path: "/",
});

export default async function HomePage() {
  const [characters, weapons, pets, loadouts, guides, officialNews] =
    await Promise.all([
      getCharacters(),
      getWeapons(),
      getPets(),
      getLoadouts(),
      getGuides(),
      getOfficialNews(),
    ]);

  const featuredCharacters = await Promise.all(
    siteConfig.featured.characters.map((id) => getCharacterById(id)),
  );
  const featuredWeapons = await Promise.all(
    siteConfig.featured.weapons.map((id) => getWeaponById(id)),
  );

  const categories = [
    {
      href: "/characters",
      label: "Characters",
      description: "Abilities, roles and Clash Squad analysis.",
      icon: CATEGORY_ICONS.characters,
      count: characters.length,
      status: "ok",
    },
    {
      href: "/weapons",
      label: "Weapons",
      description: "Stats, prices and special attributes.",
      icon: CATEGORY_ICONS.weapons,
      count: weapons.length,
      status: "ok",
    },
    {
      href: "/pets",
      label: "Pets",
      description: "Pet skills and how they support playstyles.",
      icon: CATEGORY_ICONS.pets,
      count: pets.length,
      status: "ok",
    },
    {
      href: "/loadouts",
      label: "Loadouts",
      description: "Pre-match loadout items and documented costs.",
      icon: CATEGORY_ICONS.loadouts,
      count: loadouts.length,
      status: "ok",
    },
    {
      href: "/guides",
      label: "Guides",
      description: "Original community guides and tactics.",
      icon: CATEGORY_ICONS.guides,
      count: guides.length,
      status: "empty",
    },
    {
      href: "/updates",
      label: "Updates",
      description: "Curated patch summaries with official links.",
      icon: CATEGORY_ICONS.updates,
      count: null,
      status: "empty",
    },
    {
      href: "/tools",
      label: "Tools",
      description: "Comparisons, loadout builder and more.",
      icon: CATEGORY_ICONS.tools,
      count: 4,
      status: "ok",
    },
  ];

  return (
    <>
      <ScrollProgress />
      <Hero counts={{ characters: characters.length, weapons: weapons.length, pets: pets.length }} />
      <div className="container-page pb-20">
        <section aria-label="Official news and events" className="pt-14">
          <OfficialFeedSections news={officialNews} />
        </section>

        <section aria-labelledby="browse" className="mt-14">
          <HeadingSection
            eyebrow="Browse the data"
            title="Everything in one database"
            description="Records come from a public, documented dataset. Counts below are computed live from the imported files."
          />
          <CategoryExplorer categories={categories} />
        </section>

        <FeaturedCharacters characters={featuredCharacters} />
        <FeaturedWeapons weapons={featuredWeapons} />

        <ToolShowcase />
        <EditorialSection guides={guides} loadouts={loadouts} />
        <UpdatesTeaser />
        <ToolkitBanner />
      </div>
    </>
  );
}
