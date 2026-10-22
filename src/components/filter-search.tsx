"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * URL-persisted search box for listing pages. Uncontrolled input; applies the
 * value debounced while typing and immediately on Enter. Clears on Escape.
 */
export function FilterSearch({
  placeholder,
  param = "q",
  className,
  ariaLabel,
}: {
  placeholder: string;
  param?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = (q: string) => {
    const usp = new URLSearchParams(searchParams.toString());
    if (q) usp.set(param, q);
    else usp.delete(param);
    usp.delete("page");
    const qs = usp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  // external-system sync: focus ring after URL-driven reset is unnecessary, but
  // reflect URL param into the input when navigation changes it externally
  const currentParam = searchParams.get(param) ?? "";
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== currentParam) {
      inputRef.current.value = currentParam;
    }
  }, [currentParam]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        defaultValue={currentParam}
        onChange={(e) => {
          const next = e.target.value;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => apply(next), 250);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (timer.current) clearTimeout(timer.current);
            apply(e.currentTarget.value);
          }
          if (e.key === "Escape") {
            e.currentTarget.value = "";
            apply("");
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-10 w-full rounded-lg border bg-card pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand/50"
      />
      {currentParam ? (
        <button
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            if (timer.current) clearTimeout(timer.current);
            apply("");
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
