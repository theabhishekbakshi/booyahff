"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GameImage } from "@/components/game-image";
import { Button } from "@/components/ui/button";
import { AddItemButton, ItemPicker, SelectionChip } from "@/features/tools/picker";
import { titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CharacterCompareRecord = {
  id: string;
  name: string;
  subtitle: string | null;
  keywords: string;
  image: string | null;
  skill: string | null;
  skillType: string | null;
  role: string | null;
  changeStatus: string | null;
  metaBr: boolean | null;
  metaCs: boolean | null;
  patchVersion: string | null;
  boosts: string[];
  archetype: string | null;
  priority: string | null;
};

type Row = { label: string; render: (c: CharacterCompareRecord) => React.ReactNode };

const ROWS: Row[] = [
  { label: "Skill", render: (c) => c.skill ?? na() },
  { label: "Skill type", render: (c) => c.skillType ?? na() },
  { label: "Role", render: (c) => (c.role ? titleCase(c.role) : na()) },
  { label: "Recent change", render: (c) => c.changeStatus ?? "—" },
  { label: "BR meta", render: (c) => metaText(c.metaBr) },
  { label: "CS meta", render: (c) => metaText(c.metaCs) },
  { label: "Skill boosts", render: (c) => (c.boosts.length ? c.boosts.join(", ") : na()) },
  { label: "CS archetype", render: (c) => c.archetype ?? na() },
  { label: "CS priority", render: (c) => (c.priority ? titleCase(c.priority) : na()) },
  { label: "Game version", render: (c) => c.patchVersion ?? na() },
];

function na() {
  return <span className="text-[11px] text-muted-foreground/60">Not available</span>;
}

function metaText(value: boolean | null) {
  if (value === null) return na();
  return (
    <span className={cn("text-xs font-medium", value ? "text-success" : "text-muted-foreground")}>
      {value ? "Yes" : "No"}
    </span>
  );
}

export function CharacterComparisonClient({ records }: { records: CharacterCompareRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = useMemo(() => {
    const raw = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
    return raw
      .map((id) => records.find((r) => r.id === id))
      .filter(Boolean) as CharacterCompareRecord[];
  }, [records, searchParams]);

  const toggle = (id: string) => {
    const base = selected.map((s) => s.id);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id].slice(0, 3);
    const usp = new URLSearchParams(searchParams.toString());
    if (next.length === 0) usp.delete("ids");
    else usp.set("ids", next.join(","));
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  return (
    <div>
      {/* chips */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        {selected.map((item) => (
          <SelectionChip
            key={item.id}
            item={{ id: item.id, name: item.name, subtitle: item.subtitle, image: item.image }}
            onRemove={() => toggle(item.id)}
          />
        ))}
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)} disabled={selected.length >= 3}>
          {selected.length === 0 ? "Choose characters…" : "Add more"}
        </Button>
      </div>

      <ItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={records.map((r) => ({ id: r.id, name: r.name, subtitle: r.subtitle, keywords: r.keywords, image: r.image }))}
        selectedIds={selected.map((s) => s.id)}
        onToggle={toggle}
        title="Select characters"
        description="Pick up to 3 characters from the imported dataset."
        disabledIds={selected.map((s) => s.id)}
      />

      {selected.length === 0 ? (
        <div className="mt-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <AddItemButton key={i} onClick={() => setPickerOpen(true)} label="Choose character" />
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            The comparison shows exactly what the dataset stores per character. Values marked
            “Not available” are absent in the source data (for example games-version tags).
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selected.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-xl border bg-card">
              <div className="flex items-center gap-3 border-b bg-secondary/30 p-4">
                <span className="relative size-12 overflow-hidden rounded-lg border bg-secondary/40">
                  <GameImage name={c.name} assetPath={c.image} size={48} className="size-full" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/characters/${c.id}`} className="block truncate font-semibold hover:text-brand">
                    {c.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{c.subtitle ?? ""}</p>
                </div>
              </div>
              <dl className="divide-y">
                {ROWS.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="min-w-0 text-right text-xs leading-relaxed">{row.render(c)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
