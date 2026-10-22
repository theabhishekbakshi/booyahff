import Link from "next/link";
import { Crosshair } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { CopyrightYear } from "@/components/copyright-year";

const categoryLinks = [
  { label: "Characters", href: "/characters" },
  { label: "Weapons", href: "/weapons" },
  { label: "Pets", href: "/pets" },
  { label: "Loadouts", href: "/loadouts" },
  { label: "Tools", href: "/tools" },
];

const infoLinks = [
  { label: "About", href: "/about" },
  { label: "Guides", href: "/guides" },
  { label: "Updates", href: "/updates" },
  { label: "Data sources", href: "/data-sources" },
  { label: "Contact", href: "/about#contact" },
];

const legalLinks = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Disclaimer", href: "/about#disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card/40">
      <div className="container-page py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Crosshair className="size-4" aria-hidden />
              </span>
              {siteConfig.shortName}
              <span className="text-brand">FF</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              An unofficial community database for browsing and comparing
              in-game knowledge — characters, weapons, pets and loadout items.
            </p>
          </div>
          <nav aria-label="Footer categories">
            <h2 className="text-eyebrow">Data</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {categoryLinks.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer information">
            <h2 className="text-eyebrow">Information</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer legal">
            <h2 className="text-eyebrow">Legal</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted-foreground hover:text-foreground" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Separator className="my-6" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {siteConfig.name} is an independent, unofficial fan project and is not
          affiliated with, endorsed by, or sponsored by Garena. Free Fire is a
          trademark of Garena. Game statistics are community-maintained; verify
          against the current game version before relying on them.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          © <CopyrightYear /> {siteConfig.name} — data imported from the
          public{" "}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href={siteConfig.links.dataCenter}
            rel="noopener noreferrer"
            target="_blank"
          >
            Free Fire Data Center
          </a>{" "}
          dataset.
        </p>
      </div>
    </footer>
  );
}
