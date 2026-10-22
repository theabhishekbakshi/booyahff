"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link2, Check } from "lucide-react";
import { GameImage } from "@/components/game-image";
import { Button } from "@/components/ui/button";
import { AddItemButton, ItemPicker, SelectionChip, type PickerItem } from "@/features/tools/picker";
import { cn } from "@/lib/utils";

/**
 * Shared comparison shell: URL-persisted selection (?ids=a,b), add/remove flow,
 * mobile-friendly stacked rows, per-row best-value highlight ONLY when every
 * selected item reports a value (never across gaps).
 */
export function ComparisonShell({
  param,
  all,
  max,
  toPicker,
  toCompare,
  facetLabel,
}: {
  param: string;
  all: PickerItem[];
  max: number;
  facetLabel: string;
  toPicker: (record: { id: string }) => PickerItem;
  toCompare: (id: string) => {
    rows: Array<{ label: string; text: string | null }>;
    numeric: Array<{ label: string; value: number | null; bestIs: "high" | "low" }>;
  } | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const rawIds = (searchParams.get(param) ?? "").split(",").filter(Boolean);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // URL → validated selection order (keeps results stable, drops unknown ids)
  const selected = rawIds
    .map((id) => all.find((it) => it.id === id))
    .filter(Boolean)
    .map((it) => toPicker(it! as { id: string }));

  const toggle = (id: string) => {
    const base = selected.map((s) => s.id);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id].slice(0, max);
    const usp = new URLSearchParams(searchParams.toString());
    if (next.length === 0) usp.delete(param);
    else usp.set(param, next.join(","));
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const select = selected.map((s) => s.id) as string[];
  const compareData = select
    .map((id) => {
      const d = toCompare(id);
      return d ? { id, ...d } : null;
    })
    .filter(Boolean) as Array<{ id: string; rows: { label: string; text: string | null }[]; numeric: { label: string; value: number | null; bestIs: "high" | "low" }[] }>;

  const copyLink = async () => {
    try {
      const qs = searchParams.toString();
      const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div>
      {/* selection chips */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <AnimatePresence initial={false}>
          {selected.map((item) => (
            <motion.span
              key={item.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <SelectionChip item={item} onRemove={() => toggle(item.id)} />
            </motion.span>
          ))}
        </AnimatePresence>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={selected.length >= max}
        >
          {selected.length === 0 ? `Choose ${facetLabel.toLowerCase()}…` : "Add more"}
        </Button>
        <span className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyLink} title="Copy shareable link">
            {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
            {copied ? "Copied" : "Share"}
          </Button>
        </span>
      </div>

      <ItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={all}
        selectedIds={select}
        onToggle={(id) => {
          toggle(id);
        }}
        title={`Select ${facetLabel.toLowerCase()}`}
        description={`Pick up to ${max} ${facetLabel.toLowerCase()} from the imported dataset.`}
        disabledIds={[]}
      />

      {/* compare grid */}
      {compareData.length === 0 ? (
        <div className="mt-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <AddItemButton key={i} onClick={() => setPickerOpen(true)} label={`Choose ${facetLabel.toLowerCase()}`} />
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Select {facetLabel.toLowerCase()} to see a side-by-side comparison. Missing dataset values stay
            visible as “Not available” — gaps are never treated as 0.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <MobileCards compareData={compareData} titleFor={(id) => all.find((it) => it.id === id)?.name ?? id} imageFor={(id) => all.find((it) => it.id === id)?.image ?? null} hrefFor={(id) => param === "characters" ? `/characters/${id}` : `/weapons/${id}`} />
          </div>
          <div className="mt-8 hidden sm:block">
            <CompareTable compareData={compareData} hrefBase={param === "characters" ? "/characters" : "/weapons"} />
          </div>
        </>
      )}
    </div>
  );
}

function ValueCell({ value, best }: { value: { label: string; value: number | null; bestIs: "high" | "low" }; best: number | null }) {
  const isBest = value.value !== null && best !== null && value.value === best;
  return (
    <td
      className={cn(
        "whitespace-nowrap px-3 py-2 text-right font-mono text-sm tabular-nums",
        value.value === null && "text-[11px] text-muted-foreground/60",
        isBest && "font-bold text-brand",
      )}
    >
      {value.value === null ? "Not available" : value.value}
      {isBest ? <span className="sr-only"> (best in row)</span> : null}
    </td>
  );
}

function CompareTable({
  compareData,
  hrefBase,
}: {
  compareData: Array<{ id: string; rows: { label: string; text: string | null }[]; numeric: { label: string; value: number | null; bestIs: "high" | "low" }[] }>;
  hrefBase: string;
}) {
  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border bg-card">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <caption className="sr-only">Side-by-side comparison</caption>
        <thead>
          <tr className="border-b bg-secondary/30">
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">
              Attribute
            </th>
            {compareData.map((col) => (
              <th scope="col" key={col.id} className="px-3 py-3 text-sm font-semibold">
                <Link href={`${hrefBase}/${col.id}`} className="hover:text-brand">
                  {col.rows.find((r) => r.label === "Name")?.text ?? col.id}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareData[0].numeric.map((n, i) => {
            const values = compareData.map((c) => c.numeric[i].value);
            const allPresent = values.every((v) => v !== null);
            let best: number | null = null;
            if (allPresent) {
              const nums = values as number[];
              best = n.bestIs === "high" ? Math.max(...nums) : Math.min(...nums);
            }
            return (
              <tr key={n.label} className="border-b last:border-0">
                <th scope="row" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {n.label}
                </th>
                {compareData.map((c) => (
                  <ValueCell key={c.id} value={c.numeric[i]} best={best} />
                ))}
              </tr>
            );
          })}
          {compareData[0].rows
            .filter((r) => r.label !== "Name")
            .map((row) => (
              <tr key={row.label} className="border-t">
                <th scope="row" className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {row.label}
                </th>
                {compareData.map((c) => {
                  const cell = c.rows.find((r) => r.label === row.label);
                  return (
                    <td key={c.id} className="max-w-56 px-3 py-2 text-xs leading-relaxed">
                      {cell?.text ?? <span className="text-[11px] text-muted-foreground/60">Not available</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileCards({
  compareData,
  titleFor,
  imageFor,
  hrefFor,
}: {
  compareData: Array<{ id: string; rows: { label: string; text: string | null }[]; numeric: { label: string; value: number | null; bestIs: "high" | "low" }[] }>;
  titleFor: (id: string) => string;
  imageFor: (id: string) => string | null;
  hrefFor: (id: string) => string;
}) {
  return (
    <div className="grid gap-3">
      {compareData.map((col) => (
        <div key={col.id} className="overflow-hidden rounded-xl border bg-card">
          <div className="flex items-center gap-3 border-b bg-secondary/30 p-3">
            <span className="relative size-10 overflow-hidden rounded-lg border bg-secondary/40">
              <GameImage name={titleFor(col.id)} assetPath={imageFor(col.id)} size={40} className="size-full" />
            </span>
            <Link href={hrefFor(col.id)} className="min-w-0 flex-1 truncate font-semibold hover:text-brand">
              {titleFor(col.id)}
            </Link>
          </div>
          <dl className="divide-y">
            {col.numeric.map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-3 px-3 py-2">
                <dt className="text-xs text-muted-foreground">{n.label}</dt>
                <dd className={cn("font-mono text-sm tabular-nums", n.value === null && "text-[11px] text-muted-foreground/60")}>
                  {n.value === null ? "Not available" : n.value}
                </dd>
              </div>
            ))}
            {col.rows
              .filter((r) => r.label !== "Name")
              .map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3 px-3 py-2">
                  <dt className="shrink-0 text-xs text-muted-foreground">{r.label}</dt>
                  <dd className="text-right text-xs leading-relaxed">
                    {r.text ?? <span className="text-[11px] text-muted-foreground/60">Not available</span>}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

