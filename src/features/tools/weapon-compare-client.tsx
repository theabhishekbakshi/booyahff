"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { GameImage } from "@/components/game-image";
import { Button } from "@/components/ui/button";
import { AddItemButton, ItemPicker, SelectionChip } from "@/features/tools/picker";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export type WeaponCompareRecord = {
  id: string;
  name: string;
  subtitle: string | null;
  keywords: string;
  image: string | null;
  type: string | null;
  damage: number | null;
  rateOfFire: number | null;
  range: number | null;
  magazineSize: number | null;
  price: number | null;
  armory: string | null;
  clashSquad: boolean | null;
  specialAttributes: string[];
  lastVerified: string | null;
};

type NumericRow = { label: string; key: keyof WeaponCompareRecord; bestIs: "high" | "low" | null };

const NUMERIC_ROWS: NumericRow[] = [
  { label: "Damage", key: "damage", bestIs: "high" },
  { label: "Rate of fire", key: "rateOfFire", bestIs: "high" },
  { label: "Range", key: "range", bestIs: "high" },
  { label: "Magazine size", key: "magazineSize", bestIs: "high" },
  { label: "Store price", key: "price", bestIs: "low" },
];

const INFO_ROWS: Array<{ label: string; render: (w: WeaponCompareRecord) => React.ReactNode }> = [
  { label: "Type", render: (w) => w.type ?? na() },
  { label: "Armory", render: (w) => w.armory ?? na() },
  {
    label: "Clash Squad",
    render: (w) =>
      w.clashSquad === null ? na() : <span className={w.clashSquad ? "text-success" : "text-muted-foreground"}>{w.clashSquad ? "Available" : "Not listed"}</span>,
  },
  { label: "Special attributes", render: (w) => (w.specialAttributes.length ? w.specialAttributes.join(", ") : na()) },
  { label: "Stats verified", render: (w) => (w.lastVerified ? formatDate(w.lastVerified) : na()) },
];

function na() {
  return <span className="text-[11px] text-muted-foreground/60">Not available</span>;
}

export function WeaponComparisonClient({ records }: { records: WeaponCompareRecord[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = useMemo(() => {
    const raw = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
    return raw
      .map((id) => records.find((r) => r.id === id))
      .filter(Boolean) as WeaponCompareRecord[];
  }, [records, searchParams]);

  const toggle = (id: string) => {
    const base = selected.map((s) => s.id);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id].slice(0, 4);
    const usp = new URLSearchParams(searchParams.toString());
    if (next.length === 0) usp.delete("ids");
    else usp.set("ids", next.join(","));
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  // per-row best value, only when every selected weapon reports that stat
  const numericBest = useMemo(() => {
    const best: Record<string, { value: number; id: string } | null> = {};
    for (const row of NUMERIC_ROWS) {
      const allPresent = selected.length > 0 && selected.every((w) => typeof w[row.key] === "number");
      if (!allPresent) {
        best[row.label] = null;
        continue;
      }
      const values = selected.map((w) => w[row.key] as number);
      const target = row.bestIs === "low" ? Math.min(...values) : Math.max(...values);
      best[row.label] = { value: target, id: selected[values.indexOf(target)].id };
    }
    return best;
  }, [selected]);

  return (
    <div>
      {/* chips */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <AnimatePresence initial={false}>
          {selected.map((w) => (
            <motion.span
              key={w.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <SelectionChip item={{ id: w.id, name: w.name, subtitle: w.subtitle, image: w.image }} onRemove={() => toggle(w.id)} />
            </motion.span>
          ))}
        </AnimatePresence>
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)} disabled={selected.length >= 4}>
          {selected.length === 0 ? "Choose weapons…" : "Add more"}
        </Button>
      </div>

      <ItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={records.map((r) => ({ id: r.id, name: r.name, subtitle: r.subtitle, keywords: r.keywords, image: r.image }))}
        selectedIds={selected.map((s) => s.id)}
        onToggle={toggle}
        title="Select weapons"
        description="Pick up to 4 weapons from the imported dataset."
        disabledIds={selected.map((s) => s.id)}
      />

      {selected.length === 0 ? (
        <div className="mt-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <AddItemButton key={i} onClick={() => setPickerOpen(true)} label="Choose weapon" />
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Numbers come from the imported dataset&apos;s stat scale. Rows highlight the best value
            only when every compared weapon reports that stat; a “Not available” cell means the
            dataset omits it.
          </p>
        </div>
      ) : selected.length === 1 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AddItemButton onClick={() => setPickerOpen(true)} label="Add another weapon" className="min-h-20" />
          <SingleCard weapon={selected[0]} />
        </div>
      ) : (
        <>
          {/* mobile stacked cards */}
          <div className="mt-6 grid gap-3 lg:hidden">
            {selected.map((w) => (
              <div key={w.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="flex items-center gap-3 border-b bg-secondary/30 p-3">
                  <span className="relative size-10 overflow-hidden rounded-lg border bg-secondary/40">
                    <GameImage name={w.name} assetPath={w.image} size={40} className="size-full" />
                  </span>
                  <Link href={`/weapons/${w.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
                    {w.name}
                  </Link>
                </div>
                <dl className="divide-y">
                  {NUMERIC_ROWS.map((row) => {
                    const value = w[row.key] as number | null;
                    const isBest = numericBest[row.label]?.id === w.id && value !== null;
                    return (
                      <div key={row.label} className="flex items-center justify-between px-3 py-2">
                        <dt className="text-xs text-muted-foreground">{row.label}</dt>
                        <dd className={cn("font-mono text-sm tabular-nums", isBest && "font-bold text-brand", value === null && "text-[11px] text-muted-foreground/60")}>
                          {value === null ? "Not available" : value}
                        </dd>
                      </div>
                    );
                  })}
                  {INFO_ROWS.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-3 px-3 py-2">
                      <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
                      <dd className="min-w-0 text-right text-xs leading-relaxed">{row.render(w)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          {/* desktop table */}
          <div className="mt-6 hidden overflow-x-auto scrollbar-thin rounded-xl border bg-card lg:block">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">Weapon comparison table</caption>
              <thead>
                <tr className="border-b bg-secondary/30">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Stat</th>
                  {selected.map((w) => (
                    <th scope="col" key={w.id} className="px-4 py-3">
                      <Link href={`/weapons/${w.id}`} className="inline-flex items-center gap-2 font-semibold hover:text-brand">
                        <span className="relative inline-block size-8 overflow-hidden rounded-md border bg-secondary/40">
                          <GameImage name={w.name} assetPath={w.image} size={32} className="size-full" />
                        </span>
                        <span className="whitespace-nowrap">{w.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NUMERIC_ROWS.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                      {row.label}
                    </th>
                    {selected.map((w) => {
                      const value = w[row.key] as number | null;
                      const isBest = numericBest[row.label]?.id === w.id && value !== null;
                      return (
                        <td key={w.id} className={cn("px-4 py-2.5 text-right font-mono text-sm tabular-nums", isBest && "font-bold text-brand", value === null && "text-[11px] text-muted-foreground/60")}>
                          {value === null ? "Not available" : value}
                          {isBest ? <span className="sr-only"> — best in row</span> : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t bg-secondary/10">
                  <td colSpan={selected.length + 1} className="px-4 py-2 text-xs text-muted-foreground">
                    Attributes
                  </td>
                </tr>
                {INFO_ROWS.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{row.label}</th>
                    {selected.map((w) => (
                      <td key={w.id} className="max-w-64 px-4 py-2.5 text-xs leading-relaxed">
                        {row.render(w)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Price row marks the cheapest (lowest) as best. “Clash Squad: Not listed” reflects the
            dataset — the upstream file does not record a CS flag for that weapon, so its CS status
            is unknown rather than unavailable.
          </p>
        </>
      )}
    </div>
  );
}

function SingleCard({ weapon }: { weapon: WeaponCompareRecord }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card sm:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-3 border-b bg-secondary/30 p-3">
        <span className="relative size-10 overflow-hidden rounded-lg border bg-secondary/40">
          <GameImage name={weapon.name} assetPath={weapon.image} size={40} className="size-full" />
        </span>
        <Link href={`/weapons/${weapon.id}`} className="font-semibold hover:text-brand">
          {weapon.name}
        </Link>
      </div>
      <dl className="grid grid-cols-2 divide-y sm:grid-cols-5">
        {NUMERIC_ROWS.map((row) => {
          const value = weapon[row.key] as number | null;
          return (
            <div key={row.label} className="px-3 py-2.5">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className={cn("mt-0.5 font-mono text-sm tabular-nums", value === null && "text-[11px] text-muted-foreground/60")}>
                {value === null ? "Not available" : value}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
