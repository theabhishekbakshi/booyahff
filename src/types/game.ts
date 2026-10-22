import z from "zod";

export const nullableString = z.string().nullable();
const cleanObject = <T extends z.ZodType>(shape: T) => z.nullable(shape).optional();

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  skill: z.string().nullable(),
  skillType: z.string().nullable(),
  role: z.string().nullable(),
  description: z.string().nullable(),
  changeStatus: z.string().nullable(),
  metaBr: z.boolean().nullable(),
  imageLocal: z.string().nullable(),
  metaCs: z.boolean().nullable(),
  sources: z.array(z.string()),
  lastReviewed: z.string().nullable(),
  dataConfidence: z.string().nullable(),
  patchVersion: z.string().nullable(),
  apiId: z.number().nullable(),
  skillBoosts: z.array(
    z.object({
      name: z.string().nullable(),
      effect: z.string().nullable(),
      csRead: z.string().nullable(),
    }),
  ),
  csAnalysis: cleanObject(
    z.object({
      archetype: z.string().nullable(),
      priority: z.string().nullable(),
      bestUse: z.string().nullable(),
      counterFocus: z.string().nullable(),
    }),
  ),
  csPerkNote: z.string().nullable(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const WeaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().nullable(),
  primaryType: z.string().nullable(),
  damage: z.number().nullable(),
  rateOfFire: z.number().nullable(),
  range: z.number().nullable(),
  magazineSize: z.number().nullable(),
  specialAttributes: z.array(z.string()),
  description: z.string().nullable(),
  availableInClashSquad: z.boolean().nullable(),
  price: z.number().nullable(),
  armory: z.string().nullable(),
  aliases: z.array(z.string()),
  attachments: z.array(z.string()),
  recentUpdates: z.array(z.string()),
  sources: z.array(z.string()),
  sourceNotes: z.array(z.string()),
  lastVerified: z.string().nullable(),
  dataConfidence: z.string().nullable(),
  imageLocal: z.string().nullable(),
});
export type Weapon = z.infer<typeof WeaponSchema>;

export const PetSchema = z.object({
  id: z.string(),
  name: z.string(),
  skill: z.string().nullable(),
  role: z.string().nullable(),
  description: z.string().nullable(),
  sources: z.array(z.string()).readonly(),
  lastReviewed: z.string().nullable(),
  dataConfidence: z.string().nullable(),
  imageLocal: z.string().nullable(),
});
export type Pet = z.infer<typeof PetSchema>;

export const CounterEntrySchema = z.object({
  name: z.string().nullable(),
  skill: z.string().nullable(),
  reason: z.string().nullable(),
  characterId: z.string().nullable(),
});
export const CounterProfileSchema = z.object({
  id: z.string(),
  characterId: z.string().nullable(),
  characterName: z.string(),
  skill: z.string().nullable(),
  role: z.string().nullable(),
  description: z.string().nullable(),
  counterCategory: z.string().nullable(),
  counters: z.array(CounterEntrySchema),
});
export type CounterProfile = z.infer<typeof CounterProfileSchema>;

export const CostItemSchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  cost: z.number().nullable().optional(),
  previousCost: z.number().nullable().optional(),
  changedIn: z.string().nullable().optional(),
  usage: z.string().nullable().optional(),
  cooldown: z.string().nullable().optional(),
  earnRule: z.string().nullable().optional(),
});
export type CostItem = z.infer<typeof CostItemSchema>;

export const LoadoutSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  category: z.string().nullable(),
  shortDescription: z.string().nullable(),
  tagline: z.string().nullable(),
  imageLocal: z.string().nullable(),
  descriptionBr: z.string().nullable(),
  descriptionCs: z.string().nullable(),
  cost: cleanObject(
    z.object({
      br:
        cleanObject(
          z.object({
            currency: z.string().nullable(),
            note: z.string().nullable(),
            items: z.array(CostItemSchema),
          }),
        ),
      cs:
        cleanObject(
          z.object({
            currency: z.string().nullable(),
            note: z.string().nullable(),
            items: z.array(
              z.object({
                id: z.string().nullable().optional(),
                name: z.string().nullable().optional(),
                cost: z.number().nullable().optional(),
                earnRule: z.string().nullable().optional(),
              }),
            ),
          }),
        ),
    }),
  ),
  gadgets: z.array(
    z.object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      rarity: z.string().nullable(),
      descriptionBr: z.string().nullable(),
      descriptionCs: z.string().nullable(),
    }),
  ),
  boosters: z.array(
    z.object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      rarity: z.string().nullable(),
      effect: cleanObject(
        z.object({
          br: z.string().nullable(),
          cs: z.string().nullable(),
        }),
      ),
    }),
  ),
  patchHistory: z.array(
    z.object({
      version: z.string().nullable(),
      change: z.string().nullable(),
    }),
  ),
});
export type Loadout = z.infer<typeof LoadoutSchema>;

export type SearchIndexEntry = {
  id: string;
  kind: "character" | "weapon" | "pet" | "loadout";
  title: string;
  subtitle: string | null;
  keywords: string;
  href: string;
  image: string | null;
  /** short factual snippet */
  snippet: string | null;
};

export type DataStatus = {
  source: { name: string; repoUrl: string; importScript: string };
  importedAt: string;
  inputDirectory: string;
  recordCounts: Record<string, number>;
  fileStatus: Record<string, { status: string; reason?: string | null }>;
  failures: Array<{ file: string; reason: string }>;
  dataVersions: Record<string, string | null>;
  knownLimitations: string[];
};

export type AssetSync = {
  syncedAt: string;
  downloaded: number;
  skipped: number;
  failed: number;
  files: string[];
};
