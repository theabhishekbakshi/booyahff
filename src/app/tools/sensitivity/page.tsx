import type { Metadata } from "next";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { SensitivityBuilderClient } from "@/features/tools/sensitivity-builder-client";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Sensitivity preset sheet",
  description:
    "An educational, editable sensitivity sheet for Free Fire — record and share your settings. No formula-based claims of optimality.",
  path: "/tools/sensitivity",
});

export default function SensitivityPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow="Tool & guide"
        title="Sensitivity preset sheet"
        description={
          <>
            Sensitivity is personal. This sheet lets you record values in one place, explain what
            each slider does, and copy a shareable preset. It does{" "}
            <strong>not</strong> claim to compute an optimal config — anyone promising a magic
            formula is selling certainty the game does not provide.
          </>
        }
      />
      <Reveal>
        <SensitivityBuilderClient />
      </Reveal>
      <section className="mt-8 rounded-xl border bg-card p-5" aria-label="Sensitivity guidance">
        <h2 className="text-title text-lg">How to actually tune sensitivity</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Start a training match and fire a few full-spray bursts at a fixed target with your
            current values to create a baseline.
          </li>
          <li>
            If your crosshair consistently fails to stop on the head area, raise the scope used for
            that weapon class in small steps.
          </li>
          <li>
            If you overshoot and the aim jumps past targets, lower that scope value instead.
          </li>
          <li>Change one value at a time and re-test — changing several at once hides the cause.</li>
          <li>
            Free look is for situational awareness; leave it comfortable rather than copying others.
          </li>
        </ol>
      </section>
    </div>
  );
}
