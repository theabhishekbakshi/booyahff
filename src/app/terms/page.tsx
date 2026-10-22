import type { Metadata } from "next";
import { HeadingSection } from "@/components/heading-section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { CopyrightYear } from "@/components/copyright-year";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description:
    "BooyahFF terms: unofficial fan-project disclaimers, acceptable use, data usage notes and trademark acknowledgements.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page max-w-2xl py-8 sm:py-10">
      <HeadingSection
        eyebrow="Policy"
        title="Terms of use"
        description="Basic terms for using BooyahFF. As an unofficial fan project, these terms emphasize the site's purpose and limits clearly."
      />

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-title text-lg text-foreground">Unofficial nature</h2>
          <p>
            {siteConfig.name} is an independent fan project. It is not affiliated with, endorsed by,
            or sponsored by Garena. Free Fire and its related marks belong to Garena, and this site
            makes no claim to them. Official information lives on Garena properties.
          </p>
        </section>
        <section>
          <h2 className="text-title text-lg text-foreground">Data accuracy</h2>
          <p>
            Game data is community-maintained and may be incomplete or outdated. It is provided for
            reference without warranties; verify anything critical against the live game. The site
            does not present fabricated statistics as fact and does not guarantee completeness.
          </p>
        </section>
        <section>
          <h2 className="text-title text-lg text-foreground">Acceptable use</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Do not attempt to overload, scrape abusively, or bypass security features of the site.</li>
            <li>
              Cite the underlying dataset when reusing substantial data excerpts; respect upstream
              licenses, which remain their authors&apos; responsibility.
            </li>
            <li>Never present content from this site as official Garena communications.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-title text-lg text-foreground">Liability</h2>
          <p>
            The site is offered “as is.” Nothing here can affect your game account, and no liability
            is accepted for decisions made using reference data.
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Last reviewed <CopyrightYear />
      </p>
    </div>
  );
}
