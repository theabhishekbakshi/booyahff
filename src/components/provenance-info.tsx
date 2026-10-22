import { BadgeCheck, Info } from "lucide-react";
import { formatDate, humanizeConfidence } from "@/lib/format";

/** Provenance panel — shows exactly what the dataset claims about a record. */
export function ProvenanceInfo({
  confidenceLabel,
  lastVerified,
  patchVersion,
  sources,
  notes,
}: {
  confidenceLabel: string | null;
  lastVerified: string | null;
  patchVersion: string | null;
  sources: readonly string[];
  notes?: string[];
}) {
  const hasAnything =
    confidenceLabel || lastVerified || patchVersion || sources.length > 0 || notes?.length;
  if (!hasAnything) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            No verification metadata was provided for this record by the dataset.
            Values are shown as imported; treat figures with care.
          </span>
        </p>
      </div>
    );
  }
  return (
    <section aria-label="Data provenance" className="rounded-lg border bg-muted/40 p-4">
      <dl className="grid gap-2.5 text-sm">
        {confidenceLabel ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Data confidence</dt>
            <dd className="text-right">{humanizeConfidence(confidenceLabel)}</dd>
          </div>
        ) : null}
        {lastVerified ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">
              {patchVersion ? "Last verified" : "Last reviewed"}
            </dt>
            <dd className="flex items-center gap-1.5 text-right">
              <BadgeCheck className="size-3.5 text-success" aria-hidden />
              {formatDate(lastVerified)}
            </dd>
          </div>
        ) : null}
        {patchVersion ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Game version</dt>
            <dd className="text-right font-mono">{patchVersion}</dd>
          </div>
        ) : null}
        {sources.length > 0 ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Sources</dt>
            <dd className="text-right">
              <ul className="space-y-1">
                {sources.map((src) => (
                  <li key={src}>
                    {/^https?:\/\//.test(src) ? (
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand underline underline-offset-2 hover:no-underline"
                      >
                        Official link ↗
                      </a>
                    ) : (
                      src
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {notes && notes.length > 0 ? (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            <ul className="list-disc space-y-1 pl-4">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
