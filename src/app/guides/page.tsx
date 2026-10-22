import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, PenLine, ShieldCheck, ArrowRight } from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { getGuides } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guides",
  description:
    "Original BooyahFF guides — clearly written, clearly attributed, and ready to grow into a community knowledge base.",
  path: "/guides",
});

const PLANNED = [
  {
    title: "Choosing characters by playstyle",
    outline:
      "How the dataset's role categories (Attack, Survival, Team Work, Info) map to situations like opening rotations, holding compounds, and retakes.",
  },
  {
    title: "Reading weapon stat bars",
    outline:
      "What the 0–100 stat points in our dataset represent, and how magazine size and rate of fire shape real DPS decisions.",
  },
  {
    title: "Getting value from the counter dataset",
    outline:
      "How to read the counter relationships on character pages as situational advice, not absolute matchups.",
  },
] as const;

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={guides.length > 0 ? `${guides.length} guides published` : " coming soon"}
        title="Guides"
        description="Original editorial content for BooyahFF. Every guide will list its sources and last-reviewed date — nothing is claimed as official Garena documentation."
      />

      {guides.length === 0 ? (
        <>
          <EmptyState
            icon={<BookOpen className="size-5" aria-hidden />}
            title="No guides published yet"
            description="This section is structured and waiting for its first articles. Planned coverage is listed below — content appears here as it is written and reviewed."
          />
          <section aria-labelledby="planned-guides" className="mt-10">
            <h2 id="planned-guides" className="text-title flex items-center gap-2 text-xl">
              <PenLine className="size-4 text-brand" aria-hidden /> Planned first guides
            </h2>
            <Reveal className="mt-3 grid gap-3 sm:grid-cols-3">
              {PLANNED.map((g) => (
                <div key={g.title} className="rounded-xl border border-dashed bg-card/60 p-4">
                  <h3 className="font-semibold">{g.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.outline}</p>
                </div>
              ))}
            </Reveal>
          </section>
          <Reveal className="mt-10">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-5">
              <ShieldCheck className="size-5 shrink-0 text-success" aria-hidden />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Editorial policy.</strong> Guides must be
                original, may cite the dataset platform itself for reference, and must never be
                presented as official Garena publications. Corrections are welcome.
              </p>
              <Link href="/about#contributing" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline underline-offset-4">
                About contributing <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal className="grid gap-3 md:grid-cols-2">
          {guides.map((g) => (
            <a key={g.slug} href={`/guides/${g.slug}`} className="rounded-xl border bg-card p-5 hover:border-brand/40">
              <h2 className="font-semibold">{g.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{g.excerpt}</p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                {g.readingMinutes} min read · updated {g.updatedAt}
              </p>
            </a>
          ))}
        </Reveal>
      )}
    </div>
  );
}
