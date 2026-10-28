/**
 * Brand + site configuration. Change these values to re-brand the platform
 * (name, accent color, links) — components read from this file only.
 */
export const siteConfig = {
  name: "FFIndia",
  shortName: "FF INDIA",
  tagline: "Master Your Drop",
  description:
    "An unofficial Free Fire database: explore characters, compare weapons, browse pets and loadout items, and improve your game knowledge.",
  accent: {
    primary: "#f97916", // vivid orange
    secondary: "#22d3ee", // restrained electric cyan
  },
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ffindia.example.com",
  locale: "en_US",
  links: {
    officialNews: "https://ff.garena.com/en/news/",
    officialSite: "https://ff.garena.com/",
    dataCenter: "https://github.com/misai-my/ff-center",
    ggnews: "https://ff.garena.com/",
  },
  nav: [
    { label: "Characters", href: "/characters" },
    { label: "Weapons", href: "/weapons" },
    { label: "Pets", href: "/pets" },
    { label: "Loadouts", href: "/loadouts" },
    { label: "Guides", href: "/guides" },
    { label: "Updates", href: "/updates" },
    { label: "Tools", href: "/tools" },
  ],
  /** Editorial picks for the homepage (ids, not rankings). */
  featured: {
    characters: ["alok", "chrono", "skyler"],
    weapons: ["ak47", "mp40", "awm"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
