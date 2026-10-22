"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export type PickerItem = {
  id: string;
  name: string;
  subtitle?: string | null;
  keywords?: string;
  image?: string | null;
};

/** Removable chip for a selected item. */
export function SelectionChip({
  item,
  onRemove,
}: {
  item: PickerItem;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2.5 text-sm shadow-sm">
      {item.image ? (
        <span className="relative size-6 overflow-hidden rounded-full border bg-secondary/50">
          <Image src={item.image} alt="" fill sizes="24px" className="object-contain p-0.5" />
        </span>
      ) : null}
      <span className="max-w-32 truncate font-medium">{item.name}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  );
}

/** Searchable, keyboard-friendly item picker dialog used by every tool. */
export function ItemPicker({
  open,
  onOpenChange,
  items,
  selectedIds,
  onToggle,
  title,
  description,
  multi = true,
  disabledIds = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PickerItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  title: string;
  description: string;
  multi?: boolean;
  disabledIds?: string[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 120);
    return items
      .filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          (it.subtitle ?? "").toLowerCase().includes(q) ||
          (it.keywords ?? "").toLowerCase().includes(q),
      )
      .slice(0, 120);
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b p-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1 text-xs">{description}</DialogDescription>
          <div className="relative mt-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter items…"
              aria-label="Filter items"
              className="h-10 w-full rounded-lg border bg-secondary/40 px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand/50"
            />
          </div>
        </div>
        <ul
          role="listbox"
          aria-multiselectable={multi}
          className="flex-1 overflow-y-auto scrollbar-thin p-2"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No items match “{query}”.
            </li>
          ) : (
            filtered.map((item) => {
              const selected = selectedIds.includes(item.id);
              const disabled = disabledIds.includes(item.id) && !selected;
              return (
                <li key={item.id} role="option" aria-selected={selected}>
                  <button
                    disabled={disabled}
                    onClick={() => onToggle(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selected && "bg-brand-soft",
                      disabled && "opacity-40",
                      !disabled && "hover:bg-secondary/60",
                    )}
                  >
                    {item.image ? (
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-md border bg-secondary/50">
                        <Image src={item.image} alt="" fill sizes="36px" className="object-contain p-1" />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.subtitle ?? ""}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border",
                        selected ? "border-brand bg-brand text-primary-foreground" : "text-transparent",
                      )}
                      aria-hidden
                    >
                      <Check className="size-3.5" />
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** Add-item button used to open the picker. */
export function AddItemButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-full min-h-24 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed bg-card/40 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground",
        className,
      )}
    >
      <Plus className="size-5" aria-hidden />
      <span className="font-medium">{label}</span>
    </button>
  );
}

/** Compact trigger that mirrors the picker state. */
export function PickerTrigger({ count, label }: { count: number; label: string }) {
  return (
    <>
      <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      <span>
        {label}
        {count > 0 ? ` (${count})` : ""}
      </span>
    </>
  );
}
