"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Crosshair, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search-dialog";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-14 items-center gap-2">
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

        {/* desktop nav */}
        <nav aria-label="Main" className="ml-4 hidden min-w-0 items-center gap-0.5 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                isActive(item.href) && "bg-secondary/70 text-foreground",
              )}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* search */}
          <SearchTrigger>
            <span
              className="flex h-9 items-center gap-2 rounded-md border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary md:w-56"
              aria-hidden
            >
              <Search className="size-4" />
              <span className="hidden md:inline">Search data…</span>
              <kbd className="ml-auto hidden rounded border px-1.5 font-mono text-[10px] md:inline">/</kbd>
            </span>
            <span className="sr-only">Open search</span>
          </SearchTrigger>
          <ThemeToggle />

          {/* mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
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
    </header>
  );
}
