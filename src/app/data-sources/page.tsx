import type { Metadata } from "next";
import { Database, ExternalLink, FileJson, RefreshCcw } from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { getDataMetadata } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "Data sources",
  description:
    "Where BooyahFF data comes from: the public Free Fire Data Center dataset, our normalization pipeline, and the import status including known limitations.",
  path: "/data-sources",
});

export default async function DataSourcesPage() {
  const status = await getDataMetadata();
  const filePaths = Object.keys(status.fileStatus);
  const okFiles = filePaths.filter((f) => status.fileStatus[f]?.status === "ok");
  const failedFiles = filePaths.filter((f) => status.fileStatus[f]?.status !== "ok");

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <HeadingSection
        eyebrow="Provenance"
        title="Data sources"
        description={
          <>
            Game data on this site comes exclusively from one documented public dataset. Nothing is
            scraped from third-party sites at runtime, and no API keys are used.
          </>
        }
      />

      <Reveal>
        <section className="rounded-xl border bg-card p-5" aria-label="Primary source">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Database className="size-4 text-brand" aria-hidden />
              {status.source.name}
            </h2>
            <a
              href={status.source.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline underline-offset-4"
            >
              Open repository <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>
          <dl className="mt-4 grid gap-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Imported</dt>
              <dd>{formatDateTime(status.importedAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Pipeline</dt>
              <dd className="font-mono text-xs">{status.source.importScript} → scripts/export-data.mjs</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Record counts</dt>
              <dd className="text-right">
                {Object.entries(status.counts)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => `${v} ${k}`)
                  .join(" · ")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Game versions</dt>
              <dd className="text-right font-mono text-xs">
                {Object.entries(status.dataVersions)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ") || "not recorded"}
              </dd>
            </div>
            {status.assets ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Local assets</dt>
                <dd className="text-right">
                  {status.assets.downloaded} sprites downloaded{" "}
                  <span className="text-muted-foreground">(hosted copies of the dataset&apos;s documented imgur files)</span>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </Reveal>

      <section aria-labelledby="import-log" className="mt-8">
        <h2 id="import-log" className="text-title flex items-center gap-2 text-xl">
          <FileJson className="size-4 text-brand" aria-hidden /> Import log
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[...okFiles, ...failedFiles].map((f) => {
            const s = status.fileStatus[f];
            const ok = s?.status === "ok";
            return (
              <li key={f} className="flex items-start justify-between gap-3 rounded-lg border bg-card px-3 py-2">
                <span className="font-mono text-xs">{f}</span>
                {ok ? (
                  <span className="text-xs text-success">imported</span>
                ) : (
                  <span className="text-right text-xs text-destructive">failed — {s?.reason}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="limitations" className="mt-8">
        <h2 id="limitations" className="text-title text-xl">Known limitations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          {status.knownLimitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="refresh" className="mt-8 rounded-xl border border-dashed bg-card/70 p-5">
        <h2 id="refresh" className="flex items-center gap-2 text-lg font-semibold">
          <RefreshCcw className="size-4 text-brand" aria-hidden /> Refreshing the data
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li><code className="font-mono">python scripts/import_ff_center.py</code> (in the starter kit) re-downloads the upstream dataset.</li>
          <li><code className="font-mono">npm run data:import</code> normalizes and validates it into <code className="font-mono">src/data/*.json</code>.</li>
          <li><code className="font-mono">npm run data:assets</code> re-syncs local sprite copies.</li>
          <li><code className="font-mono">npm run data:validate</code> verifies every normalized file against the schema.</li>
        </ol>
      </section>
    </div>
  );
}
