#!/usr/bin/env node
/**
 * Normalize the imported Free Fire Data Center JSON into the application schema.
 *
 * Input : <starter kit>/data/imported_ff_center/*.json   (upstream, raw)
 * Output: <app>/src/data/*.json                          (normalized, generated)
 *         <app>/src/data/status/data-status.json          (import metadata)
 *
 * Usage: node scripts/export-data.mjs
 * Env  : FF_STARTER_KIT_DIR – absolute or relative path to the starter kit
 */
import fs from "node:fs/promises";
import path from "node:path";
import z from "zod";

const APP_ROOT = path.resolve(process.cwd());
const STARTER_KIT =
  process.env.FF_STARTER_KIT_DIR ??
  path.resolve(APP_ROOT, "..", "free_fire_data_starter_kit");
const IN_DIR = path.join(STARTER_KIT, "data", "imported_ff_center");
const OUT_DIR = path.join(APP_ROOT, "src", "data");

const SOURCE = {
  name: "Free Fire Data Center (GitHub)",
  repoUrl: "https://github.com/misai-my/ff-center",
  importScript: "free_fire_data_starter_kit/scripts/import_ff_center.py",
};

/** slugify a name into a stable url id */
function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

function str(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
}

function lines(v) {
  const s = str(v);
  return s ? s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
}

/** read a raw json file; record failures but keep going */
const files = {};
const failures = [];
async function readSource(file) {
  try {
    const raw = await fs.readFile(path.join(IN_DIR, file), "utf-8");
    files[file] = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch (err) {
    files[file] = null;
    failures.push({ file, reason: err instanceof Error ? err.message : String(err) });
    console.warn(`  ! unavailable: ${file} (${err instanceof Error ? err.message : err})`);
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.join(OUT_DIR, "status"), { recursive: true });

  console.log(`Importing from: ${IN_DIR}`);
  await Promise.all(
    ["character.json", "weapon.json", "pet.json", "counter.json", "loadout.json", "asset_manifest.json"].map(
      readSource,
    ),
  );

  /* ---------------- asset index ---------------- */
  const manifest = files["asset_manifest.json"];
  const assets = manifest && Array.isArray(manifest.assets) ? manifest.assets : [];
  const KIND_DIR = { character: "characters", weapon: "weapons", pet: "pets", loadout: "loadouts" };
  /** kind:slug -> "/assets/<dir>/<slug>.<ext>" (populated by scripts/fetch-assets.mjs) */
  const localExts = {};
  for (const a of assets) {
    const dir = KIND_DIR[a?.kind];
    if (a?.remote_url && dir) {
      try {
        const ext = path.posix.extname(new URL(a.remote_url).pathname) || ".png";
        localExts[`${a.kind}:${a.slug}`] = ext;
      } catch {
        /* ignore malformed upstream url */
      }
    }
  }
  const localFor = (kind, slug) =>
    localExts[`${kind}:${slug}`] ? `/assets/${KIND_DIR[kind]}/${slug}${localExts[`${kind}:${slug}`]}` : null;

  /* ---------------- characters ---------------- */
  const rawCharacters = files["character.json"] ?? [];
  const characters = rawCharacters.map((c) => {
    const name = str(c.name);
    if (!name) return null;
    const id = slugify(name);
    return {
      id,
      name,
      skill: str(c.skill),
      skillType: str(c.skill_type),
      role: str(c.role),
      description: str(c.description),
      changeStatus: str(c.status),
      metaBr: c.meta === "yes" ? true : c.meta === "no" ? false : null,
      metaCs: c.cs_meta === "yes" ? true : c.cs_meta === "no" ? false : null,
      imageLocal: localFor("character", id),
      sources: Array.isArray(c.sources) ? c.sources.filter(Boolean) : [],
      lastReviewed: str(c.last_reviewed),
      dataConfidence: str(c.data_confidence),
      patchVersion: str(c.patch_version),
      apiId: num(c.api_id),
      skillBoosts: Array.isArray(c.skill_boosts)
        ? c.skill_boosts
            .map((b) => ({
              name: str(b?.name),
              effect: str(b?.effect),
              csRead: str(b?.cs_read),
            }))
            .filter((b) => b.name || b.effect)
        : [],
      csAnalysis: c.cs_analysis
        ? {
            archetype: str(c.cs_analysis.archetype),
            priority: str(c.cs_analysis.cs_priority ?? c.cs_analysis.priority),
            bestUse: str(c.cs_analysis.best_use),
            counterFocus: str(c.cs_analysis.counter_focus),
          }
        : null,
      csPerkNote: str(c.cs_perk_point_note),
    };
  });

  /* ---------------- weapons ---------------- */
  const rawWeapons = files["weapon.json"] ?? [];
  const weapons = rawWeapons.map((w) => {
    const name = str(w.name);
    if (!name) return null;
    const id = slugify(name);
    const type = str(w.type);
    const price = num(w.price);
    return {
      id,
      name,
      type,
      primaryType: type ? type.split("/")[0].trim() : null,
      damage: num(w.damage), // upstream scale: in-game stat points, not hp per bullet confirmable
      rateOfFire: num(w.rate_of_fire),
      range: num(w.range),
      magazineSize: num(w.magazine_size),
      specialAttributes: lines(w.special_attributes),
      description: str(w.description),
      availableInClashSquad: w.clash_squad ? str(w.clash_squad) === "CS" : null,
      price: price,
      armory: str(w.armory),
      aliases: Array.isArray(w.aliases) ? w.aliases.filter(Boolean) : [],
      attachments: Array.isArray(w.attachments)
        ? w.attachments.filter(Boolean)
        : [],
      recentUpdates: Array.isArray(w.recent_update)
        ? w.recent_update.map(str).filter(Boolean)
        : [],
      sources: Array.isArray(w.sources) ? w.sources.filter(Boolean) : [],
      sourceNotes: Array.isArray(w.source_notes) ? w.source_notes.map(str).filter(Boolean) : [],
      lastVerified: str(w.last_verified),
      dataConfidence: str(w.data_confidence),
      imageLocal: localFor("weapon", id),
    };
  });

  /* ---------------- pets ---------------- */
  const rawPets = files["pet.json"] ?? [];
  const pets = rawPets.map((p) => {
    const name = str(p.name);
    if (!name) return null;
    return {
      id: slugify(name),
      name,
      skill: str(p.skill),
      role: str(p.role),
      description: str(p.description),
      sources: [],
      lastReviewed: null,
      dataConfidence: str(p.data_confidence),
      imageLocal: localFor("pet", slugify(name)),
    };
  });

  /* ---------------- counters ---------------- */
  const rawCounters = files["counter.json"] ?? [];
  const characterIds = new Set(characters.filter(Boolean).map((c) => c.id));
  const counters = rawCounters.map((c) => {
    const name = str(c.name);
    if (!name) return null;
    return {
      id: slugify(name),
      characterId: characterIds.has(slugify(name)) ? slugify(name) : null,
      characterName: name,
      skill: str(c.skill),
      role: str(c.role),
      description: str(c.description),
      counterCategory: str(c.counter_category),
      counters: Array.isArray(c.counters)
        ? c.counters
            .map((k) => ({
              name: str(k?.name),
              skill: str(k?.skill),
              reason: str(k?.reason),
              characterId:
                k?.name && characterIds.has(slugify(String(k.name)))
                  ? slugify(String(k.name))
                  : null,
            }))
            .filter((k) => k.name)
        : [],
    };
  });

  /* ---------------- loadouts (in-match loadout slots) ---------------- */
  const rawLoadouts = files["loadout.json"] ?? [];
  const loadouts = rawLoadouts.map((l) => {
    const id = str(l.id) ? slugify(String(l.id)) : str(l.name) ? slugify(String(l.name)) : null;
    if (!id) return null;
    const name = str(l.name);
    const cost = l.cost ?? null;
    const hasContent = cost && typeof cost === "object";
    return {
      id,
      name,
      category: str(l.category),
      shortDescription: str(l.short_description),
      tagline: str(l.tagline),
      imageLocal: localFor("loadout", id),
      descriptionBr: l.description && typeof l.description === "object" ? str(l.description.br) : str(l.description),
      descriptionCs: l.description && typeof l.description === "object" ? str(l.description.cs) : null,
      cost: hasContent
        ? {
            br:
              cost.br && typeof cost.br === "object"
                ? {
                    currency: str(cost.br.currency),
                    note: str(cost.br.note),
                    items: Array.isArray(cost.br.items)
                      ? cost.br.items.map((i) => ({
                          id: str(i?.id),
                          name: str(i?.name),
                          cost: num(i?.cost),
                          previousCost: num(i?.previous_cost),
                          changedIn: str(i?.changed_in),
                          usage: str(i?.usage),
                          cooldown: str(i?.cooldown),
                        }))
                      : [],
                  }
                : null,
            cs:
              cost.cs && typeof cost.cs === "object"
                ? {
                    currency: str(cost.cs.currency),
                    note: str(cost.cs.note),
                    items: Array.isArray(cost.cs.items)
                      ? cost.cs.items.map((i) => ({
                          id: str(i?.id),
                          name: str(i?.name),
                          cost: num(i?.cost),
                          earnRule: str(i?.earn_rule),
                        }))
                      : [],
                  }
                : null,
          }
        : null,
      gadgets: Array.isArray(l.gadgets)
        ? l.gadgets.map((g) => ({
            id: str(g?.id) ? slugify(String(g.id)) : str(g?.name) ? slugify(String(g.name)) : null,
            name: str(g?.name),
            rarity: str(g?.rarity),
            descriptionBr: g?.description && typeof g.description === "object" ? str(g.description.br) : str(g?.description),
            descriptionCs: g?.description && typeof g.description === "object" ? str(g.description.cs) : null,
          }))
        : [],
      boosters: Array.isArray(l.boosters)
        ? l.boosters.map((b) => ({
            id: str(b?.id) ?? null,
            name: str(b?.name),
            rarity: str(b?.rarity),
            effect: b?.effect && typeof b.effect === "object" ? { br: str(b.effect.br), cs: str(b.effect.cs) } : null,
          }))
        : [],
      patchHistory: Array.isArray(l.patch_history)
        ? l.patch_history.map((h) => ({ version: str(h?.version), change: str(h?.change) })).filter((h) => h.version || h.change)
        : [],
    };
  });

  /* ---------------- de-dup + basic shape validation ---------------- */
  const outputSets = [
    ["characters", characters],
    ["weapons", weapons],
    ["pets", pets],
    ["counters", counters],
    ["loadouts", loadouts],
  ];
  const counts = {};
  const idShape = z.object({ id: z.string().min(1) });
  for (const [key, records] of outputSets) {
    const valid = records.filter(Boolean);
    const seen = new Set();
    for (const r of valid) {
      const parsed = idShape.safeParse({ id: r.id });
      if (!parsed.success) throw new Error(`${key}: invalid record ${JSON.stringify(r).slice(0, 200)}`);
      if (seen.has(r.id)) throw new Error(`${key}: duplicate id ${r.id}`);
      seen.add(r.id);
    }
    counts[key] = valid.length;
    await fs.writeFile(path.join(OUT_DIR, `${key}.json`), JSON.stringify(valid, null, 2));
  }

  /* ---------------- asset index (json) ---------------- */
  const assetIndex = {
    generatedFrom: str(manifest?.generated_from) ?? null,
    generatedAt: str(manifest?.generated_at) ?? null,
    version: manifest?.version ?? null,
  };
  await fs.writeFile(path.join(OUT_DIR, "asset-index.json"), JSON.stringify(assetIndex, null, 2));

  /* ---------------- status ---------------- */
  const versions = (i) => [...new Set(i.map((r) => r.patchVersion).filter(Boolean))].sort();
  const weaponVerified = [...new Set(weapons.filter(Boolean).map((r) => r.lastVerified).filter(Boolean))].sort();
  const charReviewed = [...new Set(characters.filter(Boolean).map((r) => r.lastReviewed).filter(Boolean))].sort();
  const dataStatus = {
    source: SOURCE,
    importedAt: new Date().toISOString(),
    inputDirectory: IN_DIR,
    recordCounts: counts,
    fileStatus: Object.fromEntries(
      Object.entries(files).map(([file, data]) => [
        file,
        data ? { status: "ok" } : { status: "unavailable", reason: failures.find((f) => f.file === file)?.reason ?? null },
      ]),
    ),
    failures,
    dataVersions: {
      characters:
        versions(characters).join(", ") ||
        (charReviewed.length ? `last reviewed ${charReviewed[charReviewed.length - 1]}` : null),
      weapons: weaponVerified.length ? `stats last verified ${weaponVerified[weaponVerified.length - 1]}` : null,
      pets: null,
      counters: null,
      loadouts: [...new Set(loadouts.filter(Boolean).flatMap((l) => (l.patchHistory ?? []).map((h) => h.version).filter(Boolean)))].sort().join(", ") || null,
    },
    knownLimitations: [
      "team_logos.json could not be imported: upstream JSON is malformed (GitHub repository misai-my/ff-center, branch main).",
      "events.json and redeem_codes.json upstream templates contain placeholder records only; no real events or codes are published on this site.",
      "Counts of characters (64), weapons (75), pets (23), counter profiles (23) and loadouts (4) reflect the upstream dataset; completeness is not guaranteed.",
    ],
  };
  await fs.writeFile(
    path.join(OUT_DIR, "status", "data-status.json"),
    JSON.stringify(dataStatus, null, 2),
  );

  console.log("Normalized record counts:", counts);
  console.log(`Wrote normalized JSON + data-status.json to: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error("export-data failed:", err);
  process.exitCode = 1;
});
