import type { Metadata } from "next";
import { UserRoundSearch, Lock } from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Player profile lookup",
  description:
    "Player-profile lookup page shell — live statistics require a separately configured, permitted API integration. No external calls are made.",
  path: "/tools/player-lookup",
});

export default function PlayerLookupPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Shell · not live yet"
        title="Player profile lookup"
        description="This page is a scaffold for a future live player-statistics lookup. It intentionally performs no external API calls or key usage in this phase."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5" aria-label="Lookup form preview">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserRoundSearch className="size-4 text-brand" aria-hidden /> What would live here
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex h-10 items-center rounded-lg border bg-secondary/30 px-3 text-sm text-muted-foreground/60">
              Player UID…
            </div>
            <button
              disabled
              className="h-10 w-full cursor-not-allowed rounded-lg bg-secondary/40 text-sm font-medium text-muted-foreground/50 sm:w-40"
            >
              Look up player
            </button>
          </div>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-muted-foreground">
            <li>Career overview (level, matches, wins) for the given UID</li>
            <li>Historical season summaries where the API exposes them</li>
            <li>Server/region tag with an explicit data-freshness timestamp</li>
          </ul>
        </section>

        <section className="rounded-xl border border-dashed bg-card/60 p-5" aria-label="Integration requirements">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4 text-muted-foreground" aria-hidden /> Why it is not enabled
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-xs leading-relaxed text-muted-foreground">
            <li>
              A permitted stats API must be available and its terms must allow use in a fan project.
              We will not scrape official services or ship hidden keys.
            </li>
            <li>
              Any credentials would live server-side only (never in client JSON) via environment
              variables, following the existing data-access-layer pattern.
            </li>
            <li>
              Results must show provenance and fetch timestamps like every other data section on
              this site.
            </li>
          </ol>
          <p className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            The starter kit contains a <code className="font-mono">player_api_config.json</code>{" "}
            template. No API key material is included or required for this project.
          </p>
        </section>
      </div>
    </div>
  );
}
