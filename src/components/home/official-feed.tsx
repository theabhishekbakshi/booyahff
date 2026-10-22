import {
  ArrowUpRight,
  CalendarDays,
  Flame,
  Newspaper,
  Paperclip,
  Radio,
  Trophy,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { EmptyState } from "@/components/empty-state";
import {
  officialEventItems,
  type OfficialNewsItem,
} from "@/lib/official";

const OFFICIAL_NEWS_URL = "https://ff.garena.com/en/news/";
const OFFICIAL_SITE_URL = "https://ff.garena.com/en/";

/** Every card in this file links out to Garena's official site. */
const OFFICIAL_LINK_ATTRS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

function CategoryBadge({ category }: { category: string }) {
  const isPatch = category === "Patch Note";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        isPatch
          ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          : "border-brand/30 bg-brand/10 text-brand"
      }`}
    >
      {category}
    </span>
  );
}

function CoverImage({ item, className }: { item: OfficialNewsItem; className?: string }) {
  if (!item.image) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary/60 text-muted-foreground ${className ?? ""}`}
        aria-hidden
      >
        <Paperclip className="size-5" />
      </div>
    );
  }
  return (
    // Supported external cover straight from Garena's CDN; not routed through
    // next/image because the remote host is intentionally unconfigured.
    <img
      src={item.image}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}

function DateLabel({ date }: { date: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
      <CalendarDays className="size-3.5" aria-hidden />
      {date}
    </span>
  );
}

function OfficialLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} {...OFFICIAL_LINK_ATTRS} className={className}>
      {children}
    </a>
  );
}

/* ------------------------------- news section ------------------------------ */

function NewsHeader() {
  return (
    <Reveal className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-eyebrow inline-flex items-center gap-1.5">
          <Newspaper className="size-3.5" aria-hidden /> Live from Garena
        </p>
        <h2 className="text-title mt-1 text-2xl sm:text-3xl">Latest news</h2>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Headlines mirrored from Garena&rsquo;s official site, refreshed hourly.
          All covers, titles and article pages belong to Garena.
        </p>
      </div>
      <OfficialLink
        href={OFFICIAL_NEWS_URL}
        className="group inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline underline-offset-4"
      >
        View all on ff.garena.com
        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </OfficialLink>
    </Reveal>
  );
}

function FeaturedNews({ item }: { item: OfficialNewsItem }) {
  return (
    <RevealItem className="lg:row-span-2">
      <OfficialLink
        href={item.url}
        className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_28px_-12px_rgba(249,121,22,0.25)]"
      >
        <CoverImage
          item={item}
          className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} />
            <DateLabel date={item.date} />
          </div>
          <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
          <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-brand">
            Read the official post
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </OfficialLink>
    </RevealItem>
  );
}

function CompactNews({ item }: { item: OfficialNewsItem }) {
  return (
    <RevealItem>
      <OfficialLink
        href={item.url}
        className="group flex h-full gap-3 rounded-xl border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
      >
        <CoverImage
          item={item}
          className="hidden h-16 w-24 shrink-0 rounded-lg object-cover sm:block"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={item.category} />
            <DateLabel date={item.date} />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {item.title}
          </h3>
        </div>
        <ArrowUpRight
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </OfficialLink>
    </RevealItem>
  );
}

export function OfficialNewsSection({ news }: { news: OfficialNewsItem[] }) {
  if (news.length === 0) return null;
  const [featured, ...rest] = news;
  return (
    <section aria-labelledby="official-news-heading">
      <h2 id="official-news-heading" className="sr-only">
        Latest news
      </h2>
      <NewsHeader />
      <RevealGroup className="grid gap-3 lg:grid-cols-2">
        <FeaturedNews item={featured} />
        <RevealGroup as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 4).map((item) => (
            <CompactNews key={item.id} item={item} />
          ))}
        </RevealGroup>
      </RevealGroup>
    </section>
  );
}

/* ------------------------------ events section ----------------------------- */

function EventsHeader({ count }: { count: number }) {
  return (
    <Reveal className="mb-5">
      <p className="text-eyebrow inline-flex items-center gap-1.5">
        <Flame className="size-3.5" aria-hidden /> What&rsquo;s live &amp; next up
      </p>
      <h2 className="text-title mt-1 text-2xl sm:text-3xl">Events &amp; campaigns</h2>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        {count} announced on Garena&rsquo;s official site — open a post for exact
        in-game windows, rewards and rules.
      </p>
    </Reveal>
  );
}

function EsportsCard() {
  return (
    <RevealItem>
      <OfficialLink
        href="https://www.ffesports.com/"
        className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-secondary/60 text-brand">
            <Trophy className="size-4" aria-hidden />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Esports
          </span>
        </div>
        <h3 className="font-semibold">Free Fire World Series (FFWS)</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Garena&rsquo;s global offline tournament — schedules and brackets live
          on the official esports hub.
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-brand">
          ffesports.com
          <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </OfficialLink>
    </RevealItem>
  );
}

function EventCard({ item }: { item: OfficialNewsItem }) {
  const isCollab = item.category === "Collaboration";
  return (
    <RevealItem>
      <OfficialLink
        href={item.url}
        className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-secondary/60 text-brand">
            {isCollab ? (
              <Paperclip className="size-4" aria-hidden />
            ) : (
              <Flame className="size-4" aria-hidden />
            )}
          </span>
          <CategoryBadge category={item.category} />
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug">{item.title}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <DateLabel date={item.date} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
            Official post
            <ArrowUpRight className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </OfficialLink>
    </RevealItem>
  );
}

export function OfficialEventsSection({ news }: { news: OfficialNewsItem[] }) {
  const events = officialEventItems(news).slice(0, 5);
  if (events.length === 0 && news.length === 0) return null;

  return (
    <section aria-labelledby="official-events-heading" className="mt-12">
      <h2 id="official-events-heading" className="sr-only">
        Events and campaigns
      </h2>
      <EventsHeader count={Math.max(events.length, 1)} />
      <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
        <EsportsCard />
      </RevealGroup>
      <Reveal className="mt-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Radio className="size-3.5" aria-hidden />
          Dates are announcement dates from official posts — unofficial mirror,
          not affiliated with Garena.
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------ shared wrapper ----------------------------- */

export function OfficialFeedSections({ news }: { news: OfficialNewsItem[] }) {
  if (news.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper className="size-5" aria-hidden />}
        title="Official feed unavailable right now"
        description="The mirror of Garena's news and events could not be reached this moment. Everything official lives on their site:"
        action={
          <OfficialLink
            href={OFFICIAL_SITE_URL}
            className="inline-flex items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/70"
          >
            Open ff.garena.com <ArrowUpRight className="size-3.5" aria-hidden />
          </OfficialLink>
        }
      />
    );
  }
  return (
    <>
      <OfficialNewsSection news={news} />
      <OfficialEventsSection news={news} />
    </>
  );
}
