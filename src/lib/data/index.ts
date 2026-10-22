/**
 * Server data-access layer for normalized JSON.
 *
 * Components must not import raw JSON files directly — call these accessors so a
 * future database implementation can replace the implementation without
 * touching page code (local JSON → validated data → D1 → Worker API).
 */
import fs from "node:fs/promises";
import z from "zod";
import {
  CharacterSchema,
  CounterProfileSchema,
  LoadoutSchema,
  PetSchema,
  WeaponSchema,
  type Character,
  type CounterProfile,
  type DataStatus,
  type Loadout,
  type Pet,
  type SearchIndexEntry,
  type Weapon,
} from "@/types/game";

/* ------------------------------------------------------------------ */
/* dataset caching + shapes                                            */
/* ------------------------------------------------------------------ */

const cache = { sources: {} as Record<string, unknown>, loaded: false };
const pathJson = (name: string) => `${process.cwd()}/src/data/${name}.json`;

/** @internal drop malformed records instead of throwing
 * normalized files are generated; this guards against manual edits */
function safeParseAll<T>(
  schema: z.ZodType<T>,
  raw: unknown[],
  label: string,
): T[] {
  const out: T[] = [];
  const dropped: unknown[] = [];
  for (const record of raw) {
    const parsed = schema.safeParse(record);
    if (parsed.success) out.push(parsed.data as T);
    else dropped.push(record);
  }
  if (dropped.length > 0) {
    console.warn(
      `[data] dropped ${dropped.length} malformed ${label} record(s):`,
      dropped.length === 1
        ? (dropped[0] as Record<string, unknown>)?.id
        : dropped.slice(0, 5).map((d) => (d as Record<string, unknown>).id),
    );
  }
  return out;
}

async function load() {
  if (cache.loaded) return cache.sources;
  const read = async (name: string) =>
    JSON.parse(await fs.readFile(pathJson(name), "utf8")) as unknown[];

  cache.sources.characters = safeParseAll<Character>(
    CharacterSchema,
    await read("characters"),
    "character",
  );
  cache.sources.weapons = safeParseAll<Weapon>(
    WeaponSchema,
    await read("weapons"),
    "weapon",
  );
  cache.sources.pets = safeParseAll<Pet>(PetSchema, await read("pets"), "pet");
  cache.sources.counters = safeParseAll<CounterProfile>(
    CounterProfileSchema,
    await read("counters"),
    "counter profile",
  );
  cache.sources.loadouts = safeParseAll<Loadout>(
    LoadoutSchema,
    await read("loadouts"),
    "loadout",
  );
  cache.sources.search = cache.sources.search ?? buildSearchIndex(
    cache.sources.characters as Character[],
    cache.sources.weapons as Weapon[],
    cache.sources.pets as Pet[],
    cache.sources.loadouts as Loadout[],
  );
  cache.loaded = true;
  return cache.sources;
}

function buildSearchIndex(
  characters: Character[],
  weapons: Weapon[],
  pets: Pet[],
  loadouts: Loadout[],
): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const c of characters) {
    entries.push({
      id: c.id,
      kind: "character",
      title: c.name,
      subtitle: c.skill ?? null,
      keywords: `${c.name} ${c.skill ?? ""} ${c.role ?? ""} ${c.skillType ?? ""} character`,
      href: `/characters/${c.id}`,
      image: c.imageLocal ?? null,
      snippet: c.description ?? null,
    });
  }
  for (const w of weapons) {
    entries.push({
      id: w.id,
      kind: "weapon",
      title: w.name,
      subtitle: w.type ?? null,
      keywords: `${w.name} ${w.type ?? ""} ${(w.aliases ?? []).join(" ")} weapon`,
      href: `/weapons/${w.id}`,
      image: w.imageLocal ?? null,
      snippet: w.description ?? null,
    });
  }
  for (const p of pets) {
    entries.push({
      id: p.id,
      kind: "pet",
      title: p.name,
      subtitle: p.skill ?? null,
      keywords: `${p.name} ${p.skill ?? ""} pet ${p.role ?? ""}`,
      href: `/pets/${p.id}`,
      image: p.imageLocal ?? null,
      snippet: p.description ?? null,
    });
  }
  for (const l of loadouts) {
    entries.push({
      id: l.id,
      kind: "loadout",
      title: l.name ?? l.id,
      subtitle: l.category ?? null,
      keywords: `loadout ${l.name ?? ""} ${l.id} ${l.category ?? ""}`,
      href: `/loadouts/${l.id}`,
      image: l.imageLocal ?? null,
      snippet: l.shortDescription ?? null,
    });
  }
  return entries;
}

/* ------------------------------------------------------------------ */
/* characters                                                          */
/* ------------------------------------------------------------------ */

export async function getCharacters(): Promise<Character[]> {
  "use cache";
  return (await load()).characters as Character[];
}

export async function getCharacterById(id: string): Promise<Character | null> {
  "use cache";
  const all = await getCharacters();
  return all.find((c) => c.id === id) ?? null;
}

export async function getCharacterRoles(): Promise<string[]> {
  "use cache";
  const all = await getCharacters();
  const roles = new Set(all.map((c) => c.role).filter(Boolean)) as Set<string>;
  return [...roles].sort();
}

/* ------------------------------------------------------------------ */
/* weapons                                                             */
/* ------------------------------------------------------------------ */

export async function getWeapons(): Promise<Weapon[]> {
  "use cache";
  return (await load()).weapons as Weapon[];
}

export async function getWeaponById(id: string): Promise<Weapon | null> {
  "use cache";
  const all = await getWeapons();
  return all.find((w) => w.id === id) ?? null;
}

export async function getWeaponTypes(): Promise<string[]> {
  "use cache";
  const all = await getWeapons();
  const types = new Set(
    all.map((w) => w.primaryType).filter(Boolean),
  ) as Set<string>;
  return [...types].sort();
}

/* ------------------------------------------------------------------ */
/* pets                                                                */
/* ------------------------------------------------------------------ */

export async function getPets(): Promise<Pet[]> {
  "use cache";
  return (await load()).pets as Pet[];
}

export async function getPetById(id: string): Promise<Pet | null> {
  "use cache";
  const all = await getPets();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPetRoles(): Promise<string[]> {
  "use cache";
  const all = await getPets();
  const roles = new Set(all.map((p) => p.role).filter(Boolean)) as Set<string>;
  return [...roles].sort();
}

/* ------------------------------------------------------------------ */
/* counters                                                            */
/* ------------------------------------------------------------------ */

export async function getCounterProfiles(): Promise<CounterProfile[]> {
  "use cache";
  return (await load()).counters as CounterProfile[];
}

export async function getCharacterCounters(characterId: string): Promise<{
  profile: CounterProfile | null;
  mentionedBy: Array<{ characterId: string; name: string; skill: string | null; reason: string | null }>;
}> {
  "use cache";
  const profiles = await getCounterProfiles();
  const profile = profiles.find((c) => c.characterId === characterId) ?? null;
  const mentionedBy = profiles
    .filter((c) =>
      c.counters.some((k) => k.characterId === characterId),
    )
    .map((c) => ({
      characterId: c.characterId ?? c.id,
      name: c.characterName,
      skill: c.skill,
      reason:
        c.counters.find((k) => k.characterId === characterId)?.reason ?? null,
    }));
  return { profile, mentionedBy };
}

/* ------------------------------------------------------------------ */
/* loadouts                                                            */
/* ------------------------------------------------------------------ */

export async function getLoadouts(): Promise<Loadout[]> {
  "use cache";
  return (await load()).loadouts as Loadout[];
}

export async function getLoadoutById(id: string): Promise<Loadout | null> {
  "use cache";
  const all = await getLoadouts();
  return all.find((l) => l.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* editorial collections (empty until populated by maintainers)         */
/* ------------------------------------------------------------------ */

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  updatedAt: string;
  sources: string[];
};

export type GameUpdate = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  officialUrl: string | null;
  lastCheckedAt: string | null;
  status: string;
};

/** No guide content has been imported yet — returns an empty collection. */
export async function getGuides(): Promise<Guide[]> {
  return [];
}

export async function getGuide(slug: string): Promise<Guide | null> {
  void slug;
  return null;
}

/** No verified official announcements have been imported yet. */
export async function getUpdates(): Promise<GameUpdate[]> {
  return [];
}

export async function getUpdate(slug: string): Promise<GameUpdate | null> {
  void slug;
  return null;
}

/** No officially verified redeem codes — never publish unverified codes. */
export async function getRedeemCodes(): Promise<
  Array<{ code: string; region: string; officialSourceUrl: string; expiresAt: string | null }>
> {
  return [];
}

export async function getEvents(): Promise<
  Array<{
    id: string;
    title: string;
    startsAt: string | null;
    endsAt: string | null;
    officialUrl: string | null;
    summary: string | null;
  }>
> {
  return [];
}

/* ------------------------------------------------------------------ */
/* search                                                              */
/* ------------------------------------------------------------------ */

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase().normalize("NFKD");
}

export async function searchGameData(
  query: string,
  opts?: { limit?: number; kind?: SearchIndexEntry["kind"] | null },
): Promise<SearchIndexEntry[]> {
  "use cache";
  const q = normalizeQuery(query);
  if (q.length === 0) return [];
  const sources = await load();
  let entries = sources.search as SearchIndexEntry[];
  if (opts?.kind) entries = entries.filter((e) => e.kind === opts.kind);
  const limit = opts?.limit ?? 200;
  const scored: Array<{ entry: SearchIndexEntry; score: number }> = [];
  for (const entry of entries) {
    const title = normalizeQuery(entry.title);
    const subtitle = normalizeQuery(entry.subtitle ?? "");
    const haystack = `${title} ${subtitle} ${normalizeQuery(entry.snippet ?? "")} ${normalizeQuery(entry.keywords)}`;
    let score = 0;
    if (q === title) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (subtitle.includes(q)) score = 40;
    else if (haystack.includes(q)) score = 20;
    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  "use cache";
  return (await load()).search as SearchIndexEntry[];
}

/* ------------------------------------------------------------------ */
/* metadata / provenance                                               */
/* ------------------------------------------------------------------ */

export type AppDataStatus = DataStatus & {
  counts: Record<string, number>;
  assets: { downloaded: number; failed: number; syncedAt: string | null } | null;
};

export async function getDataMetadata(): Promise<AppDataStatus> {
  "use cache";
  const sources = await load();
  const raw = JSON.parse(
    await fs.readFile(`${process.cwd()}/src/data/status/data-status.json`, "utf8"),
  ) as DataStatus;
  let assets: AppDataStatus["assets"] = null;
  try {
    const sync = JSON.parse(
      await fs.readFile(`${process.cwd()}/src/data/status/asset-sync.json`, "utf8"),
    ) as { syncedAt: string; downloaded: number; failed: number };
    assets = {
      downloaded: sync.downloaded,
      failed: sync.failed,
      syncedAt: sync.syncedAt,
    };
  } catch {
    assets = null;
  }
  return {
    ...raw,
    counts: {
      characters: (sources.characters as Character[]).length,
      weapons: (sources.weapons as Weapon[]).length,
      pets: (sources.pets as Pet[]).length,
      counterProfiles: (sources.counters as CounterProfile[]).length,
      loadouts: (sources.loadouts as Loadout[]).length,
    },
    assets,
  };
}
