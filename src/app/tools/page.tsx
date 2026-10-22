import type { Metadata } from "next";
import Link from "next/link";
import {
  Crosshair,
  GitCompareArrows,
  Swords,
  Dices,
  Gauge,
  UserRoundSearch,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { Reveal } from "@/components/reveal";
import { pageMetadata } from "@/lib/seo";

const ACTIVE = [
  {
    href: "/tools/weapon-compare",
    title: "Weapon comparison",
    description: "Compare up to four weapons — stats from the dataset, missing values explicit, shareable URL state.",
    icon: Swords,
  },
  {
    href: "/tools/character-compare",
    title: "Character comparison",
    description: "Side-by-side character abilities, roles and Clash Squad notes as recorded by the dataset.",
    icon: GitCompareArrows,
  },
  {
    href: "/tools/loadout-builder",
    title: "Loadout builder",
    description: "Compose a squad (3 characters + 1 pet) with shareable links. The docs describe abilities; no invented synergy scoring.",
    icon: Dices,
  },
  {
    href: "/tools/sensitivity",
    title: "Sensitivity preset sheet",
    description: "An educational, editable preset sheet to record and share your settings — it does not claim formula-verified optimality.",
    icon: Gauge,
  },
];

const SHELLS = [
  {
    title: "Damage calculator",
    description:
      "A numerical damage calculator needs verified formulas (armor factors, headshot multipliers per range). The dataset currently has no such formula records, so this tool is not implemented to avoid inventing numbers.",
    icon: Calculator,
    status: "Blocked on verified formulas",
  },
  {
    title: "Player profile lookup",
    description:
      "Live player statistics require a separately configured, permitted API integration. This phase ships only the page shell with no external calls and no keys.",
    icon: UserRoundSearch,
    status: "Waiting on API integration",
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: "Tools",
  description:
    "Working Free Fire utilities: weapon comparison, character comparison, loadout builder and an educational sensitivity preset sheet.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="container-page py-8 sm:py-10">
      <HeadingSection
        eyebrow={`${ACTIVE.length} working tools`}
        title="Tools"
        description="Each card below opens a genuinely functional utility. Tools that would require fabricated formulas or external APIs are deliberately listed as shells, not fake dashboards."
      />

      <Reveal className="grid gap-3 sm:grid-cols-2">
        {ACTIVE.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg border bg-secondary/60 text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <Crosshair className="size-4 text-muted-foreground/30 group-hover:text-brand" aria-hidden />
              </div>
              <h2 className="mt-3 font-semibold">{tool.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-brand">
                Open <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          );
        })}
      </Reveal>

      <section aria-labelledby="planned" className="mt-10">
        <h2 id="planned" className="text-title text-xl">Shells &amp; planned tools</h2>
        <Reveal className="mt-3 grid gap-3 sm:grid-cols-2">
          {SHELLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.title} className="rounded-xl border border-dashed bg-card/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-secondary/40 text-muted-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {tool.status}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{tool.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
              </div>
            );
          })}
        </Reveal>
      </section>
    </div>
  );
}
