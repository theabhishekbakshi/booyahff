import type { Metadata } from "next";
import { HeadingSection } from "@/components/heading-section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { CopyrightYear } from "@/components/copyright-year";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "BooyahFF privacy practices: no accounts, no trackers, minimal local storage, and transparent about any third-party loads.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-2xl py-8 sm:py-10">
      <HeadingSection
        eyebrow="Policy"
        title="Privacy policy"
        description="Plain-language privacy practices for BooyahFF. This page documents behavior as built; it is not a legally-reviewed document."
      />

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-title text-lg text-foreground">What we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Nothing by default. There are no accounts and no user-submitted data on this site.</li>
            <li>
              Your theme preference and sensitivity sheet are stored only in your own browser
              (localStorage) and are never sent to us.
            </li>
            <li>Comparison and squad links are encoded in the URL itself — nothing is stored server-side.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-title text-lg text-foreground">Third-party requests</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>
              All game sprites are served locally from this site; pages do not hotlink game asset
              hosts.
            </li>
            <li>
              Fonts are self-hosted via the build. We do not load third-party analytics or ad
              scripts. If that changes, this page will be updated first.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-title text-lg text-foreground">Notifications about changes</h2>
          <p>
            This policy is a static snapshot. Material changes will be listed here. Questions:
            see the <a href="/about#contact" className="text-brand underline underline-offset-2">about page</a>.
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Last reviewed <CopyrightYear /> · {siteConfig.name} is not affiliated with Garena.
      </p>
    </div>
  );
}
