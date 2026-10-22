import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Rss } from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { getGuides } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Updates",
  description:
    "Curated Free Fire update coverage — patch summaries publish only with an official source link. No fabricated codes or fake announcements.",
  path: "/updates",
});

export default async function UpdatesPage() {
  const guides = await getGuides();

  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Curated newsroom"
        title="Game updates"
        description="Only curated summaries that point to official announcements are published here. Unverified redeem codes are never shown — codes expire and are region-limited."
      />

      <EmptyState
        icon={<Newspaper className="size-5" aria-hidden />}
        title="No curated update posts yet"
        description={
          <>
            The update feed has not been populated yet. For current announcements, use the{" "}
            <a className="text-brand underline underline-offset-2 hover:no-underline" href={siteConfig.links.officialNews} target="_blank" rel="noopener noreferrer">
              official Free Fire news page
            </a>
            . When curation begins, each post will link its official source and show the last-checked
            date.
          </>
        }
        action={
          <Link href="/data-sources" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline underline-offset-4">
            <Rss className="size-3.5" aria-hidden /> How updates will be sourced
          </Link>
        }
      />

      {guides.length > 0 ? (
        <Reveal as="section" className="mt-10">
          <h2 className="text-title text-xl">Related reading</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {guides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-xl border bg-card p-4 hover:border-brand/40">
                <h3 className="font-semibold">{g.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{g.excerpt}</p>
              </Link>
            ))}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
