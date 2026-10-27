import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Database,
  Info,
  Mail,
  ScrollText,
  ShieldCheck,
  SunMoon,
} from "lucide-react";
import { HeadingSection } from "@/components/heading-section";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { AuthCard } from "@/features/settings/auth-card";
import { AppearanceControl } from "@/features/settings/appearance-control";

export const metadata: Metadata = pageMetadata({
  title: "Settings",
  description:
    "Manage your account (log in or sign up) and site preferences — appearance, theme and helpful resources — for the BooyahFF Free Fire database.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <HeadingSection
        eyebrow="Account & preferences"
        title="Settings"
        description="Manage your profile and tune how the platform looks and behaves. Everything on this page is local to your browser."
      />

      <div className="space-y-8">
        {/* login / signup block */}
        <section aria-label="Account">
          <AuthCard />
        </section>

        {/* other settings */}
        <section aria-labelledby="preferences-label">
          <h2 id="preferences-label" className="text-eyebrow">Preferences</h2>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border bg-card">
            <SettingsRow
              icon={SunMoon}
              title="Appearance"
              description="Light, dark, or follow your system theme."
              control={<AppearanceControl />}
            />
          </div>
        </section>

        <section aria-labelledby="resources-label">
          <h2 id="resources-label" className="text-eyebrow">Resources</h2>
          <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border bg-card">
            <SettingsLinkRow
              href="/about"
              icon={Info}
              title="About"
              description="What this platform is and how it is built."
            />
            <SettingsLinkRow
              href="/data-sources"
              icon={Database}
              title="Data sources"
              description="Where every stat and record comes from."
            />
            <SettingsLinkRow
              href="/privacy"
              icon={ShieldCheck}
              title="Privacy policy"
              description="What is (and isn't) collected when you visit."
            />
            <SettingsLinkRow
              href="/terms"
              icon={ScrollText}
              title="Terms of service"
              description="The fine print for using the platform."
            />
            <SettingsLinkRow
              href={`mailto:${siteConfig.name.toLowerCase()}@example.com`}
              icon={Mail}
              title="Contact"
              description="Report data corrections or feedback."
              external
            />
          </div>
        </section>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {siteConfig.name} is an unofficial fan project and is not affiliated with,
          endorsed by, or sponsored by Garena. See the{" "}
          <Link href="/about" className="text-brand underline underline-offset-2">
            about page
          </Link>{" "}
          for details.
        </p>
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  description,
  control,
}: {
  icon: typeof SunMoon;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block text-xs text-muted-foreground">{description}</span>
        </span>
      </div>
      {control}
    </div>
  );
}

function SettingsLinkRow({
  href,
  icon: Icon,
  title,
  description,
  external = false,
}: {
  href: string;
  icon: typeof SunMoon;
  title: string;
  description: string;
  external?: boolean;
}) {
  const className =
    "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-none";
  return (
    <Link
      href={href}
      className={className}
      {...(external ? { rel: "noopener noreferrer" } : {})}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
