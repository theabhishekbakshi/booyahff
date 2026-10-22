"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Search,
  SearchX,
  Swords,
  Users,
  Package,
  PawPrint,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SearchIndexEntry } from "@/types/game";

const KIND_LABEL: Record<SearchIndexEntry["kind"], string> = {
  character: "Character",
  weapon: "Weapon",
  pet: "Pet",
  loadout: "Loadout",
};

const KIND_ICON: Record<SearchIndexEntry["kind"], typeof Users> = {
  character: Users,
  weapon: Swords,
  pet: PawPrint,
  loadout: Package,
};

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const i = text.toLowerCase().indexOf(q);
  if (!q || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-brand-soft px-[1px] text-brand-foreground dark:text-[#ffd9b8]">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchIndexEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // debounce server queries
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length === 0) return; // empty query renders empty state; see handler
    const controller = new AbortController();
    const t = setTimeout(
      async (q: string) => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          const data: { results: SearchIndexEntry[] } = await res.json();
          setResults(data.results ?? []);
          setActiveIndex(0);
          setLoading(false);
        } catch {
          /* aborted */
        }
      },
      150,
      q,
    );
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [open, query]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
      setLoading(false);
      setResults([]);
    }
    onOpenChange(next);
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    if (next.trim() === "") {
      setResults([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  };

  const go = useCallback(
    (entry: SearchIndexEntry) => {
      onOpenChange(false);
      router.push(entry.href);
    },
    [router, onOpenChange],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return; // radix handles closing
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex]);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelectorAll("li")[activeIndex]
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Search game data</DialogTitle>
        {/* input row */}
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search characters, weapons, pets…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search game data"
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          ) : query ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : (
            <kbd className="hidden rounded-md border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
              esc
            </kbd>
          )}
        </div>

        {/* results */}
        <div className="max-h-[min(50vh,420px)] overflow-y-auto scrollbar-thin" aria-live="polite">
          {query.trim() === "" ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Type to search {`characters, weapons, pets and loadout items`}. Try{" "}
              <span className="text-foreground">&ldquo;alok&rdquo;</span> or{" "}
              <span className="text-foreground">&ldquo;mp40&rdquo;</span>.
            </div>
          ) : !loading && results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
              <SearchX className="size-6 opacity-50" aria-hidden />
              <p className="text-sm">No matches for &ldquo;{query.trim()}&rdquo;</p>
            </div>
          ) : (
            <ul ref={listRef} role="listbox" aria-label="Search results">
              {results.map((entry, i) => {
                const Icon = KIND_ICON[entry.kind];
                return (
                  <li key={`${entry.kind}-${entry.id}`} role="option" aria-selected={i === activeIndex}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => go(entry)}
                      onMouseMove={() => setActiveIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left",
                        i === activeIndex && "bg-secondary/70",
                      )}
                    >
                      {entry.image ? (
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-md border bg-secondary/50">
                          <Image
                            src={entry.image}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-contain p-1"
                          />
                        </span>
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-secondary/50">
                          <Icon className="size-4 text-muted-foreground" aria-hidden />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          <Highlight text={entry.title} query={query} />
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {entry.subtitle ?? entry.kind}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {KIND_LABEL[entry.kind]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Global "/" and Ctrl/Cmd+K opener */
export function SearchTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (!typing && (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "k"))) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn("group", className)}
        aria-label="Open search"
      >
        {children}
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
