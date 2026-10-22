"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border bg-card text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="text-title mt-4 text-3xl">Something broke mid-match</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected error occurred while rendering this page. It has been logged — try again, or
        navigate from the menu.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-hover"
      >
        Try again
      </button>
    </div>
  );
}
