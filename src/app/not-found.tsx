import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl border bg-card text-brand">
        <Gamepad2 className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">404 · Out of zone</p>
      <h1 className="text-title mt-2 text-3xl sm:text-4xl">This page dropped somewhere else</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        The record you are looking for does not exist in the dataset — or the link is stale.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/characters"
          className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:border-brand/40"
        >
          Characters
        </Link>
        <Link href="/weapons" className="rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:border-brand/40">
          Weapons
        </Link>
        <Link href="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-hover">
          Home
        </Link>
      </div>
    </div>
  );
}
