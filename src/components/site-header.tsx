"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Calculator,
  ChevronDown,
  Crosshair,
  Menu,
  Newspaper,
  Search,
  Swords,
  UserSearch,
  Wrench,
  X,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search-dialog";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Tool-section links surfaced through the "Tools ⌄" pill. */
const TOOL_LINKS = [
  { label: "Weapon Compare", href: "/tools/weapon-compare", icon: Swords },
  { label: "Character Compare", href: "/tools/character-compare", icon: UserSearch },
  { label: "Damage Calculator", href: "/tools/damage-calculator", icon: Calculator },
  { label: "Loadout Builder", href: "/tools/loadout-builder", icon: Wrench },
  { label: "Sensitivity", href: "/tools/sensitivity", icon: Palette },
  { label: "Player Lookup", href: "/tools/player-lookup", icon: UserSearch },
];

const MORE_LINKS = [
  { label: "Guides", href: "/guides", icon: BookOpen },
  { label: "Updates", href: "/updates", icon: Newspaper },
];

/** fcmobileforum.com-style floating capsule navbar:
 * sticky wrapper with a blurred page-tinted strip; inside it a rounded
 * bordered panel (shadow-lg) holding logo, an inset pill channel for nav,
 * a fake search field that opens the search dialog, theme toggle and an
 * accent CTA. Pill row scrolls instead of wrapping; dropdown pills mirror
 * the "Tools ⌄ / More ⌄" groups of the reference design. */
export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-[1440px] px-3 pt-2.5 pb-2.5 lg:px-4">
          {/* floating capsule panel; justify-between splits the leftover space
              equally between brand/channel and channel/right cluster */}
          <div
            className={cn(
              "relative z-30 flex min-h-[52px] items-center justify-between gap-2 rounded-xl border px-2 py-2 shadow-lg lg:min-h-[64px] lg:rounded-2xl lg:px-5 lg:py-3.5",
              "bg-card text-foreground",
            )}
          >
            {/* brand */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
              aria-label={`${siteConfig.name} home`}
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Crosshair className="size-4" aria-hidden />
              </span>
              <span>
                {siteConfig.shortName}
                <span className="text-brand">FF</span>
              </span>
            </Link>

            {/* desktop nav channel */}
            <nav
              aria-label="Main"
              className="mx-2 hidden overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex lg:min-w-0 lg:flex-nowrap lg:items-center lg:justify-center lg:rounded-xl lg:border lg:bg-background/60 lg:p-1"
            >
              <ul className="flex flex-nowrap items-center justify-center">
                {[
                  { label: "Home", href: "/" },
                  ...siteConfig.nav.filter(
                    (item) =>
                      item.href !== "/tools" &&
                      item.href !== "/guides" &&
                      item.href !== "/updates",
                  ),
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={
                        // isActive uses a startsWith() prefix match that would
                        // keep Home active everywhere — "/" must match exactly
                        (item.href === "/" ? pathname === "/" : isActive(item.href))
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "shrink-0 select-none whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors xl:px-5 xl:text-sm",
                        (item.href === "/" ? pathname === "/" : isActive(item.href))
                          ? "bg-card text-foreground shadow-inner"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <NavDropdown
                    label="Tools"
                    active={isActive("/tools")}
                    items={TOOL_LINKS}
                  />
                </li>
                <li>
                  <NavDropdown
                    label="More"
                    active={MORE_LINKS.some((m) => isActive(m.href))}
                    items={MORE_LINKS}
                  />
                </li>
              </ul>
            </nav>

            {/* right cluster */}
            <div className="flex shrink-0 items-center gap-1.5 lg:gap-2.5">
              {/* desktop search field (opens the global search dialog) */}
              <SearchTrigger className="hidden lg:block">
                <span
                  aria-hidden
                  className="relative flex h-9 w-44 items-center rounded-xl border bg-background pl-9 pr-3 text-sm text-muted-foreground transition-colors placeholder:text-foreground/30 hover:border-brand/40 focus-within:border-brand/50 focus-within:shadow-[0_0_15px_rgba(249,121,22,0.1)] xl:w-56"
                >
                  <Search className="absolute left-3 size-4 text-muted-foreground/70" />
                  <span className="truncate">Search data…</span>
                  <kbd className="ml-auto rounded border px-1.5 font-mono text-[10px]">/</kbd>
                </span>
                <span className="sr-only">Open search</span>
              </SearchTrigger>

              {/* mobile inline search field (like the reference design) */}
              <SearchTrigger className="min-w-0 flex-1 lg:hidden">
                <span
                  aria-hidden
                  className="relative flex h-8 items-center rounded-xl border bg-background pl-8 pr-2 text-sm text-muted-foreground transition-colors"
                >
                  <Search className="absolute left-2.5 size-4 text-muted-foreground/70" />
                  <span className="truncate text-xs">Search…</span>
                </span>
                <span className="sr-only">Open search</span>
              </SearchTrigger>

              <ThemeToggle className="hidden size-9 rounded-xl border bg-foreground/5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-brand sm:flex" />

              {/* accent CTA */}
              <Link
                href="/tools/weapon-compare"
                className="flex shrink-0 select-none items-center justify-center rounded-lg bg-brand px-3 py-2 text-xs font-extrabold whitespace-nowrap text-brand-foreground shadow-sm transition-all active:scale-95 lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm hover:bg-brand-hover"
              >
                Compare
              </Link>

              {/* mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-xl border bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground lg:hidden"
                    aria-label="Open navigation menu"
                    aria-expanded={mobileOpen}
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] p-0">
                  <SheetTitle className="sr-only">Site navigation</SheetTitle>
                  <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center justify-between border-b px-4">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                          <Crosshair className="size-3.5" aria-hidden />
                        </span>
                        {siteConfig.name}
                      </span>
                      <button
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close navigation menu"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                    <nav aria-label="Mobile main" className="flex-1 overflow-y-auto p-3">
                      <ul className="space-y-1">
                        {siteConfig.nav.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "block rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                                isActive(item.href) && "bg-secondary/70 text-foreground",
                              )}
                              aria-current={isActive(item.href) ? "page" : undefined}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <div className="border-t p-3 text-xs text-muted-foreground">
                      Unofficial fan project — not affiliated with Garena.
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/** "Tools ⌄"-style pill spawning a dropdown panel of links. */
function NavDropdown({
  label,
  active,
  items,
}: {
  label: string;
  active: boolean;
  items: Array<{ label: string; href: string; icon: typeof Swords }>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-expanded={open}
          className={cn(
            "flex shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors group/pill xl:px-5 xl:text-sm",
            active
              ? "bg-card text-foreground shadow-inner"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="whitespace-nowrap">{label}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3 shrink-0 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-48 rounded-xl border bg-popover p-1.5 shadow-xl"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            asChild
            className="rounded-lg px-2.5 py-2 text-sm font-medium"
          >
            <Link href={item.href} onClick={() => setOpen(false)}>
              <item.icon className="size-4 text-muted-foreground" aria-hidden />
              <span className={cn(isActive(item.href) && "text-brand")}>
                {item.label}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
