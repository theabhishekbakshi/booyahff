import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import Link from "next/link";
import { HeadingSection } from "@/components/heading-section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Damage calculator",
  description:
    "The damage calculator is not implemented yet: it needs verified damage/armor formulas. This page explains exactly what is missing.",
  path: "/tools/damage-calculator",
});

export default function DamageCalculatorPage() {
  return (
    <div className="container-page py-8 sm:py-10 max-w-2xl">
      <HeadingSection
        eyebrow="Planned · blocked"
        title="Damage calculator"
        description="This tool is deliberately not live. A calculator that shows invented numbers is worse than no calculator."
      />
      <section className="rounded-xl border bg-card p-5 text-sm leading-relaxed text-muted-foreground" aria-label="Status">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <Calculator className="size-4 text-brand" aria-hidden /> What is needed first
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Verified per-weapon damage values against armor/armor penetration rules for the current game version.</li>
          <li>Confirmed headshot multiplier per weapon class.</li>
          <li>Range falloff behavior documented for shotguns and rifles.</li>
        </ul>
        <p className="mt-3">
          Weapon stats themselves can be browsed in the{" "}
          <Link href="/tools/weapon-compare" className="text-brand hover:underline underline-offset-2">
            weapon comparison tool
          </Link>
          , which only compares dataset records.
        </p>
      </section>
    </div>
  );
}
