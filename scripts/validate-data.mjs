#!/usr/bin/env node
/** Validate normalized JSON against the application schemas. Usage: npm run data:validate */
import fs from "node:fs/promises";
import path from "node:path";
import zod from "zod";

const APP_ROOT = process.cwd();
const DATA_DIR = path.join(APP_ROOT, "src", "data");

/* minimal mirror of src/types/game.ts (kept in sync) */
const nullable = (schema) => zod.nullable(schema);
const cool = { name: zod.string(), effect: zod.string(), csRead: zod.string() };

const schemas = {
  "characters.json": zod.array(
    zod.object({
      id: zod.string().min(1),
      name: zod.string().min(1),
      skill: nullable(zod.string()),
      skillType: nullable(zod.string()),
      role: nullable(zod.string()),
      description: nullable(zod.string()),
      changeStatus: nullable(zod.string()),
      metaBr: zod.boolean().nullable(),
      metaCs: zod.boolean().nullable(),
      imageLocal: nullable(zod.string()),
      sources: zod.array(zod.string()),
      lastReviewed: nullable(zod.string()),
      dataConfidence: nullable(zod.string()),
      patchVersion: nullable(zod.string()),
      apiId: zod.number().nullable(),
      csPerkNote: nullable(zod.string()),
      skillBoosts: zod.array(zod.object(cool)),
      csAnalysis: nullable(
        zod.object({
          archetype: nullable(zod.string()),
          priority: nullable(zod.string()),
          bestUse: nullable(zod.string()),
          counterFocus: nullable(zod.string()),
        }),
      ),
    }),
  ),
  "weapons.json": zod.array(
    zod.object({
      id: zod.string().min(1),
      name: zod.string().min(1),
      type: nullable(zod.string()),
      primaryType: nullable(zod.string()),
      damage: zod.number().nullable(),
      rateOfFire: zod.number().nullable(),
      range: zod.number().nullable(),
      magazineSize: zod.number().nullable(),
      specialAttributes: zod.array(zod.string()),
      description: nullable(zod.string()),
      availableInClashSquad: zod.boolean().nullable(),
      price: zod.number().nullable(),
      armory: nullable(zod.string()),
      aliases: zod.array(zod.string()),
      attachments: zod.array(zod.string()),
      recentUpdates: zod.array(zod.string()),
      sources: zod.array(zod.string()),
      sourceNotes: zod.array(zod.string()),
      lastVerified: nullable(zod.string()),
      dataConfidence: nullable(zod.string()),
      imageLocal: nullable(zod.string()),
    }),
  ),
  "pets.json": zod.array(
    zod.object({
      id: zod.string().min(1),
      name: zod.string().min(1),
      skill: nullable(zod.string()),
      role: nullable(zod.string()),
      description: nullable(zod.string()),
      sources: zod.array(zod.string()),
      lastReviewed: zod.null(),
      dataConfidence: nullable(zod.string()),
      imageLocal: nullable(zod.string()),
    }),
  ),
  "counters.json": zod.array(
    zod.object({
      id: zod.string().min(1),
      characterId: nullable(zod.string()),
      characterName: zod.string().min(1),
      skill: nullable(zod.string()),
      role: nullable(zod.string()),
      description: nullable(zod.string()),
      counterCategory: nullable(zod.string()),
      counters: zod.array(
        zod.object({
          name: nullable(zod.string()),
          skill: nullable(zod.string()),
          reason: nullable(zod.string()),
          characterId: nullable(zod.string()),
        }),
      ),
    }),
  ),
  "loadouts.json": zod.array(
    zod.object({
      id: zod.string().min(1),
      name: nullable(zod.string()),
      category: nullable(zod.string()),
      shortDescription: nullable(zod.string()),
      tagline: nullable(zod.string()),
      imageLocal: nullable(zod.string()),
      descriptionBr: nullable(zod.string()),
      descriptionCs: nullable(zod.string()),
      cost: nullable(
        zod.object({
          br: nullable(
            zod.object({
              currency: nullable(zod.string()),
              note: nullable(zod.string()),
              items: zod.array(zod.record(zod.string(), zod.any())),
            }),
          ),
          cs: nullable(zod.record(zod.string(), zod.any())),
        }),
      ),
      gadgets: zod.array(zod.record(zod.string(), zod.any())),
      boosters: zod.array(zod.record(zod.string(), zod.any())),
      patchHistory: zod.array(
        zod.object({ version: nullable(zod.string()), change: nullable(zod.string()) }),
      ),
    }),
  ),
  "asset-index.json": zod.object({
    generatedFrom: nullable(zod.string()),
    generatedAt: nullable(zod.string()),
    version: zod.any().optional(),
  }),
  "status/data-status.json": zod.object({
    source: zod.object({ name: zod.string(), repoUrl: zod.string(), importScript: zod.string() }),
    importedAt: zod.string(),
    inputDirectory: zod.string(),
    recordCounts: zod.record(zod.string(), zod.number()),
    fileStatus: zod.record(zod.string(), zod.object({ status: zod.string(), reason: zod.string().optional() })),
    failures: zod.array(zod.object({ file: zod.string(), reason: zod.string() })),
    dataVersions: zod.record(zod.string(), zod.nullable(zod.string())),
    knownLimitations: zod.array(zod.string()),
  }),
};

let failed = 0;
for (const [file, schema] of Object.entries(schemas)) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    const data = JSON.parse(raw);
    const parsed = schema.safeParse(data);
    if (parsed.success) {
      const n = Array.isArray(data) ? `${data.length} records` : "ok";
      console.log(`  ok   ${file} (${n})`);
    } else {
      failed++;
      console.error(`  FAIL ${file}:`);
      for (const issue of parsed.error.issues.slice(0, 5)) {
        console.error(`        ${issue.path.join(".")}: ${issue.message}`);
      }
    }
  } catch (err) {
    failed++;
    console.error(`  FAIL ${file}: ${err.message}`);
  }
}
if (failed > 0) {
  console.error(`Validation failed for ${failed} file(s).`);
  process.exit(1);
}
console.log("All normalized data files valid.");
