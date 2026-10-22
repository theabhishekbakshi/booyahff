"use client";

import { useEffect, useState } from "react";

/**
 * Client-rendered copyright year. `new Date()` is stability-checked during
 * prerender (even inside client components), so the value is only computed
 * after mount via a deferred timer.
 */
export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setYear(new Date().getFullYear()), 0);
    return () => clearTimeout(id);
  }, []);

  return year !== null ? <>{year}</> : null;
}
