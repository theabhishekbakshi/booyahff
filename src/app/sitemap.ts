import type { MetadataRoute } from "next";
import { getCharacters, getWeapons, getPets, getLoadouts, getGuides, getUpdates, getDataMetadata } from "@/lib/data";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [characters, weapons, pets, loadouts, guides, updates, status] = await Promise.all([
    getCharacters(),
    getWeapons(),
    getPets(),
    getLoadouts(),
    getGuides(),
    getUpdates(),
    getDataMetadata(),
  ]);
  // deterministic timestamp: uses the import date, not an unstable clock read
  const lastModified = new Date(status.importedAt);

  const base = siteConfig.url;
  const entry = (path: string, opts?: { priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.7,
  });

  return [
    entry("/", { priority: 1, changeFrequency: "daily" }),
    entry("/characters", { priority: 0.9 }),
    ...characters.map((c) => entry(`/characters/${c.id}`, { priority: 0.8 })),
    ...characters.map((c) => entry(`/characters/${c.id}/counters`, { priority: 0.6 })),
    entry("/weapons", { priority: 0.9 }),
    ...weapons.map((w) => entry(`/weapons/${w.id}`, { priority: 0.8 })),
    entry("/pets", { priority: 0.8 }),
    ...pets.map((p) => entry(`/pets/${p.id}`, { priority: 0.7 })),
    entry("/loadouts", { priority: 0.7 }),
    ...loadouts.map((l) => entry(`/loadouts/${l.id}`, { priority: 0.6 })),
    entry("/tools", { priority: 0.8, changeFrequency: "monthly" }),
    entry("/tools/weapon-compare", { priority: 0.8, changeFrequency: "monthly" }),
    entry("/tools/character-compare", { priority: 0.8, changeFrequency: "monthly" }),
    entry("/tools/loadout-builder", { priority: 0.8, changeFrequency: "monthly" }),
    entry("/tools/sensitivity", { priority: 0.6, changeFrequency: "monthly" }),
    entry("/tools/player-lookup", { priority: 0.3, changeFrequency: "yearly" }),
    entry("/tools/damage-calculator", { priority: 0.2, changeFrequency: "yearly" }),
    entry("/guides", { priority: 0.6 }),
    ...guides.map((g) => entry(`/guides/${g.slug}`, { priority: 0.6 })),
    entry("/updates", { priority: 0.6 }),
    ...updates.map((u) => entry(`/updates/${u.slug}`, { priority: 0.6 })),
    entry("/about", { priority: 0.5, changeFrequency: "yearly" }),
    entry("/data-sources", { priority: 0.5, changeFrequency: "yearly" }),
    entry("/privacy", { priority: 0.3, changeFrequency: "yearly" }),
    entry("/terms", { priority: 0.3, changeFrequency: "yearly" }),
  ];
}
