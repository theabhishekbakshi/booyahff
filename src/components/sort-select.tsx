"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = { value: string; label: string };

/** URL-persisted sort dropdown (keyboard accessible via radix Select). */
export function SortSelect({
  options,
  value,
  param = "sort",
  className,
  ariaLabel = "Sort results",
}: {
  options: SortOption[];
  value: string;
  param?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (next: string) => {
    const usp = new URLSearchParams(searchParams.toString());
    if (next === "default") usp.delete(param);
    else usp.set(param, next);
    usp.delete("page"); // sorting resets pagination
    const qs = usp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const current = options.find((o) => o.value === value)?.value ?? "default";

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9 w-[170px] gap-1.5 bg-card text-sm", className)}
      >
        <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
