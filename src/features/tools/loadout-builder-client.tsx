"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameImage } from "@/components/game-image";
import { AddItemButton, ItemPicker } from "@/features/tools/picker";
import { titleCase } from "@/lib/format";

type BuilderCharacter = {
  id: string;
  name: string;
  image: string | null;
  skill: string | null;
  skillType: string | null;
  role: string | null;
  metaBr: boolean | null;
  metaCs: boolean | null;
};

type BuilderPet = {
  id: string;
  name: string;
  image: string | null;
  skill: string | null;
  role: string | null;
};

/**
 * Squad composition tool: up to 3 characters (a squad) + 1 pet.
 * No invented synergy rules — this panel simply lays the documented abilities
 * side by side so players can reason about combinations themselves.
 */
export function LoadoutBuilderClient({
  characters,
  pets,
}: {
  characters: BuilderCharacter[];
  pets: BuilderPet[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [charPickerOpen, setCharPickerOpen] = useState(false);
  const [petPickerOpen, setPetPickerOpen] = useState(false);

  const chars = useMemo(() => {
    const raw = (searchParams.get("chars") ?? "").split(",").filter(Boolean);
    return raw.map((id) => characters.find((c) => c.id === id)).filter(Boolean) as BuilderCharacter[];
  }, [characters, searchParams]);

  const pet = useMemo(() => {
    const id = searchParams.get("pet");
    if (!id) return null;
    return pets.find((p) => p.id === id) ?? null;
  }, [pets, searchParams]);

  const commit = (updates: { chars?: BuilderCharacter[]; pet?: BuilderPet | null }) => {
    const usp = new URLSearchParams(searchParams.toString());
    if (updates.chars) {
      if (updates.chars.length === 0) usp.delete("chars");
      else usp.set("chars", updates.chars.map((c) => c.id).join(","));
    }
    if (updates.pet !== undefined) {
      if (updates.pet === null) usp.delete("pet");
      else usp.set("pet", updates.pet.id);
    }
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const toggleChar = (id: string) => {
    const base = chars.map((c) => c.id);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id].slice(0, 3);
    commit({ chars: characters.filter((c) => next.includes(c.id)) });
  };

  const setPet = (id: string) => {
    const found = pets.find((p) => p.id === id);
    if (found) commit({ pet: found });
  };

  const clearAll = () => commit({ chars: [], pet: null });

  const empty = chars.length === 0 && !pet;

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <span className="text-xs text-muted-foreground">
          Squad: {chars.length}/3 · Pet: {pet ? "1/1" : "0/1"}
        </span>
        <span className="grow" />
        <Button variant="ghost" size="sm" onClick={clearAll} disabled={empty}>
          <Trash2 className="size-3.5" aria-hidden /> Clear all
        </Button>
      </div>

      {/* composition panel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-eyebrow">Characters (max 3, no duplicates)</h2>
            <Button variant="secondary" size="sm" onClick={() => setCharPickerOpen(true)}>
              {chars.length ? "Add / change" : "Add character"}
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chars.map((c) => (
              <div key={c.id} className="rounded-xl border bg-secondary/20 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative size-10 overflow-hidden rounded-lg border bg-secondary/40">
                    <GameImage name={c.name} assetPath={c.image} size={40} className="size-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/characters/${c.id}`} className="block truncate text-sm font-semibold hover:text-brand">
                      {c.name}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[c.skillType, c.role ? titleCase(c.role) : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleChar(c.id)}
                    aria-label={`Remove ${c.name}`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {c.skill ?? "Ability not documented"}
                </p>
              </div>
            ))}
            {chars.length < 3 ? (
              <AddItemButton onClick={() => setCharPickerOpen(true)} label="Add character" className="min-h-28" />
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <h2 className="text-eyebrow">Pet (single slot)</h2>
            <Button variant="secondary" size="sm" onClick={() => setPetPickerOpen(true)}>
              {pet ? "Change pet" : "Add pet"}
            </Button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {pet ? (
              <div className="rounded-xl border bg-secondary/20 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative size-10 overflow-hidden rounded-lg border bg-secondary/40">
                    <GameImage name={pet.name} assetPath={pet.image} size={40} className="size-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/pets/${pet.id}`} className="block truncate text-sm font-semibold hover:text-brand">
                      {pet.name}
                    </Link>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {pet.role ? titleCase(pet.role) : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => commit({ pet: null })}
                    aria-label={`Remove ${pet.name}`}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {pet.skill ?? "Skill not documented"}
                </p>
              </div>
            ) : (
              <AddItemButton onClick={() => setPetPickerOpen(true)} label="Add pet" className="min-h-24" />
            )}
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-4">
          <h2 className="text-eyebrow">Composition summary</h2>
          {empty ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Add characters and a pet to compose a squad. The builder documents abilities but does
              not invent synergy rules.
            </p>
          ) : (
            <div className="mt-3 space-y-3 text-sm">
              {chars.map((c) => (
                <div key={c.id} className="rounded-lg border bg-secondary/20 p-3">
                  <p className="font-semibold">{c.skill ?? c.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {c.skillType} · {c.role ? titleCase(c.role) : ""}
                  </p>
                </div>
              ))}
              {pet ? (
                <div className="rounded-lg border bg-secondary/20 p-3">
                  <p className="font-semibold">{pet.skill ?? pet.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Pet passive support · {pet.role ? titleCase(pet.role) : ""}
                  </p>
                </div>
              ) : null}
              <p className="text-xs leading-relaxed text-muted-foreground">
                The composition panel shows documented abilities only — the dataset does not define
                compatibility rules, so nothing is scored.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* pickers */}
      <ItemPicker
        open={charPickerOpen}
        onOpenChange={setCharPickerOpen}
        items={characters.map((c) => ({ id: c.id, name: c.name, subtitle: c.skill ?? null, keywords: `${c.skill ?? ""} ${c.role ?? ""}`, image: c.image }))}
        selectedIds={chars.map((c) => c.id)}
        onToggle={toggleChar}
        title="Select characters"
        description="Pick up to 3 (a full squad). Duplicates are disabled."
        disabledIds={chars.map((c) => c.id)}
      />
      <ItemPicker
        open={petPickerOpen}
        onOpenChange={setPetPickerOpen}
        items={pets.map((p) => ({ id: p.id, name: p.name, subtitle: p.skill ?? null, keywords: `${p.skill ?? ""} ${p.role ?? ""}`, image: p.image }))}
        selectedIds={pet ? [pet.id] : []}
        onToggle={setPet}
        title="Select a pet"
        description="One pet per squad, mirroring the in-game rule."
        multi={false}
      />

      {/* screen-reader friendly selection chips */}
      <div className="sr-only" aria-live="polite">
        {pet ? `Selected pet: ${pet.name}.` : "No pet selected."}
      </div>
    </div>
  );
}
