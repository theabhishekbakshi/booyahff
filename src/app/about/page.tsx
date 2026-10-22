import type { Metadata } from "next";
import { getDataMetadata } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { HeadingSection } from "@/components/heading-section";
import { Heading } from "@/components/typography";
import { siteConfig } from "@/config/site";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What BooyahFF is: an independent, unofficial Free Fire database built from a documented public dataset, with honest empty states and provenance.",
  path: "/about",
});

export default async function AboutPage() {
  // revalidate this page at most once an hour; build-time data snapshot otherwise
  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <HeadingSection
        eyebrow="Independent fan project"
        title="About BooyahFF"
        description="A rebuild of the gaming-database idea with honesty as the design constraint."
      />

      <div className="prose-style space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section aria-labelledby="what">
          <Heading id="what" level={2}>What this platform is</Heading>
          <p>
            {siteConfig.name} is an unofficial knowledge platform for the Garena Free Fire
            community. It is built entirely on a public, documented dataset maintained by the Free
            Fire Data Center project, normalized into our own schema, and served without any
            database or external API. Where the dataset is complete — characters, weapons, pets,
            counter notes — pages are rich. Where it is not — events, redeem codes, guides — the
            site tells you plainly rather than inventing records.
          </p>
          <p className="mt-3">
            That philosophy drives the product design: every number you see is attributed to a
            source and date; every comparison marks gaps instead of treating them as zero; and no
            page fabricates tier lists, win rates, or codes.
          </p>
        </section>

        <section aria-labelledby="features">
          <Heading id="features" level={2}>What you can do here</Heading>
          <ul className="list-disc space-y-2 pl-5">
            <li>Browse and search 64 characters with ability details and BR/CS data flags.</li>
            <li>Compare weapon stats with honest “Not available” cells for missing values.</li>
            <li>Read community counter analysis with the right caveats on every page.</li>
            <li>Compose squads with the loadout builder and share a linkable state.</li>
            <li>Record your sensitivity settings on an educational sheet.</li>
          </ul>
        </section>

        <section aria-labelledby="disclaimer">
          <Heading id="disclaimer" level={2}>Disclaimer</Heading>
          <p>
            {siteConfig.name} is an independent, unofficial fan project. It is not affiliated with,
            endorsed by, or sponsored by Garena. Free Fire and related marks are trademarks of
            Garena. Game data is community-maintained and may lag behind the live game version —
            verify critical details in-game. Contact us only for content corrections:
            <strong className="text-foreground"> corrections@booyahff.example.com</strong> (placeholder
            until a real mailbox is provisioned).
          </p>
        </section>

        <section id="contributing" aria-labelledby="contributing" className="scroll-mt-20">
          <Heading id="contributing" level={2}>Contributing</Heading>
          <p>
            The site is fully data-driven: refresh the import pipeline and the site updates.
            Corrections to records should include the official patch note or in-game screenshot that
            documents the change. Guides must be original and clearly attributed.
          </p>
        </section>

        <section id="contact" aria-labelledby="contact" className="scroll-mt-20">
          <Heading id="contact" level={2}>Contact</Heading>
          <p>
            Corrections and feedback: corrections@booyahff.example.com (placeholder). Legal and
            licensing questions: see <a className="text-brand underline underline-offset-2" href="/data-sources">data sources</a>.
          </p>
        </section>

        <DataSnapshotInline />
      </div>
    </div>
  );
}

async function DataSnapshotInline() {
  const status = await getDataMetadata();
  return (
    <section aria-labelledby="snapshot">
      <Heading id="snapshot" level={2}>Current data snapshot</Heading>
      <p>
        Imported {formatDateTime(status.importedAt)} from{" "}
        <a href={status.source.repoUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-2">
          {status.source.name}
        </a>
        : {Object.entries(status.counts).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(" · ")}.
      </p>
    </section>
  );
}
