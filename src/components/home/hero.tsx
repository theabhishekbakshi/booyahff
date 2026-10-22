"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Search, Swords, Users } from "lucide-react";
import { SearchTrigger } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ counts }: { counts: { characters: number; weapons: number; pets: number } }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // subtle GSAP parallax on the background layers (skipped with reduced motion)
  useEffect(() => {
    const section = sectionRef.current;
    if (reduce || !section) return;
    gsap.registerPlugin(ScrollTrigger);
    const triggers: ScrollTrigger[] = [];

    // 1) parallax layers
    const layers = section.querySelectorAll<HTMLElement>("[data-parallax]");
    layers.forEach((layer) => {
      const depth = Number(layer.dataset.parallax) || 10;
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          animation: gsap.to(layer, { yPercent: depth, ease: "none" }),
        }),
      );
    });

    // 2) scroll-out scrub: hero content lifts + fades while scrolling away
    const content = section.querySelector<HTMLElement>("[data-hero-content]");
    if (content) {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom 18%",
          scrub: 0.5,
          animation: gsap.to(content, {
            yPercent: -12,
            opacity: 0.25,
            scale: 0.97,
            ease: "none",
          }),
        }),
      );
    }

    // 3) ambient blob drift (independent of scroll)
    section.querySelectorAll<HTMLElement>("[data-drift]").forEach((blob) => {
      const range = Number(blob.dataset.drift) || 24;
      gsap.to(blob, {
        y: range,
        x: range / 2,
        scale: 1.06,
        duration: 9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    // 4) stat count-ups (once, when stats enter viewport)
    section.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => {
      const targetValue = Number(el.dataset.countup);
      if (Number.isNaN(targetValue)) return;
      const state = { v: 0 };
      gsap.to(state, {
        v: targetValue,
        duration: 1.4,
        ease: "power2.out",
        snap: { v: 1 },
        onUpdate: function render() {
          el.textContent = String(Math.round(state.v));
        },
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    });

    return () => {
      triggers.forEach((t) => t.kill());
      section.querySelectorAll("[data-parallax], [data-hero-content], [data-drift]").forEach(
        (el) => gsap.killTweensOf(el),
      );
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill();
      });
    };
  }, [reduce]);

  const entrance = reduce
    ? {}
    : { opacity: 0, y: 20, filter: "blur(8px)" };
  const enter = (delay: number) =>
    ({
      initial: entrance,
      animate: reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: { duration: 0.7, ease: EASE, delay },
    });

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="relative overflow-hidden border-b"
    >
      {/* layered original tactical background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div data-parallax="6" className="absolute inset-0 surface-tactical surface-hero-fade" />
        <div
          data-parallax="-9"
          data-drift="26"
          className="absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #f9791633, transparent 70%)" }}
        />
        <div
          data-parallax="-5"
          data-drift="18"
          className="absolute -right-40 top-24 h-[380px] w-[520px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, #2fd4e655, transparent 70%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent opacity-0" />
      </div>

      <div data-hero-content className="container-page flex flex-col items-center pb-14 pt-16 text-center sm:pt-20 md:pb-20">
        <motion.span
          {...enter(0)}
          className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
          Unofficial Free Fire database · community-maintained
        </motion.span>

        <motion.h1
          {...enter(0.08)}
          className="text-title mt-5 max-w-3xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl"
        >
          {siteConfig.tagline}.
          <span className="block bg-gradient-to-r from-brand via-[#ffb257] to-signal bg-clip-text text-transparent">
            Learn every matchup.
          </span>
        </motion.h1>

        <motion.p
          {...enter(0.16)}
          className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Explore characters, compare weapons, discover loadout items and pets —
          everything sourced from a common public dataset, with provenance on
          every page.
        </motion.p>

        {/* hero search */}
        <motion.div {...enter(0.24)} className="mt-7 w-full max-w-xl">
          <SearchTrigger className="w-full">
            <span className="flex h-12 w-full items-center gap-3 rounded-xl border bg-card/80 px-4 text-left text-sm text-muted-foreground shadow-sm backdrop-blur transition-colors hover:border-brand/50 hover:bg-card">
              <Search className="size-4 shrink-0" aria-hidden />
              <span className="truncate">
                Search {counts.characters} characters, {counts.weapons} weapons, {counts.pets} pets…
              </span>
              <kbd className="ml-auto hidden shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] sm:block">
                /
              </kbd>
            </span>
          </SearchTrigger>
        </motion.div>

        <motion.div
          {...enter(0.32)}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="group">
            <Link href="/characters">
              <Users className="size-4" aria-hidden />
              Explore characters
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/weapons">
              <Swords className="size-4" aria-hidden />
              Explore weapons
            </Link>
          </Button>
        </motion.div>

        <motion.dl
          {...enter(0.4)}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm"
        >
          {[
            { label: "Characters", value: counts.characters, href: "/characters" },
            { label: "Weapons", value: counts.weapons, href: "/weapons" },
            { label: "Pets", value: counts.pets, href: "/pets" },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col items-center gap-0.5"
            >
              <dt className="order-2 text-xs text-muted-foreground group-hover:text-foreground">
                {stat.label}
              </dt>
              <dd
                data-countup={stat.value}
                className="order-1 font-mono text-2xl font-bold tabular-nums text-foreground group-hover:text-brand"
              >
                {stat.value}
              </dd>
            </Link>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
