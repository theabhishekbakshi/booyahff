import { cacheLife } from "next/cache";

/**
 * Live feed from Garena's official Free Fire site (ff.garena.com).
 *
 * The official site server-renders its news list in stable markup, so we
 * mirror titles/dates/categories/links honestly — we never invent events
 * or dates, and every card links back to the official post.
 */

export type OfficialNewsItem = {
  id: number;
  title: string;
  category: string;
  /** dd/mm/yyyy exactly as printed on the official site */
  date: string;
  /** absolute link to the official article */
  url: string;
  /** absolute cover image URL (empty string when the post has no cover) */
  image: string;
};

const OFFICIAL_BASE = "https://ff.garena.com";
const NEWS_LIST_URL = `${OFFICIAL_BASE}/en/news/`;

/** Categories that describe live/upcoming in-game events & crossovers. */
export const EVENT_CATEGORIES = new Set(["Announcement", "Collaboration"]);

function decodeEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** dd/mm/yyyy → descending-sort key */
function dateKey(date: string): number {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  if (!match) return 0;
  const [, dd, mm, yyyy] = match;
  return Number(yyyy) * 10000 + Number(mm) * 100 + Number(dd);
}

function extractItems(html: string): OfficialNewsItem[] {
  const seen = new Set<number>();
  const items: OfficialNewsItem[] = [];

  const itemRe = /<li id="(\d+)" class="news-item[\s\S]*?<\/li>/g;
  for (const match of html.matchAll(itemRe)) {
    const id = Number(match[1]);
    if (!Number.isFinite(id) || seen.has(id)) continue;
    const chunk = match[0];

    const hrefMatch = /href="\/en\/article\/(\d+)\/"/.exec(chunk);
    const imageMatch = /data-src="(https:\/\/cdn[^"]+)"/.exec(chunk);
    const timeMatch = /news-time[^>]*>([^<]+)</.exec(chunk);
    const categoryMatch = /news-category[^>]*>([^<]+)</.exec(chunk);
    const titleMatch = /news-title[^>]*>([\s\S]*?)<\/h4>/.exec(chunk);
    const altMatch = /alt="([^"]*)"/.exec(chunk);

    const date = timeMatch ? decodeEntities(timeMatch[1]) : "";
    const titleSource = titleMatch ? titleMatch[1] : altMatch ? altMatch[1] : "";
    const title = decodeEntities(titleSource.replace(/<[^>]+>/g, ""));
    if (!title || !date || !hrefMatch || hrefMatch[1] !== String(id)) continue;

    seen.add(id);
    items.push({
      id,
      title,
      category: categoryMatch ? decodeEntities(categoryMatch[1]) : "News",
      date,
      url: `${OFFICIAL_BASE}/en/article/${id}/`,
      image: imageMatch ? imageMatch[1] : "",
    });
  }

  return items.sort((a, b) => dateKey(b.date) - dateKey(a.date));
}

/** Newest-first feed of all official posts (Announcement, Patch Note, Collab, DevBlog). */
export async function getOfficialNews(): Promise<OfficialNewsItem[]> {
  "use cache";
  // Server revalidates the mirrored feed hourly; stale content keeps serving
  // while a refresh happens in the background.
  cacheLife({ stale: 900, revalidate: 3600, expire: 86400 });

  try {
    const response = await fetch(NEWS_LIST_URL, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return [];
    return extractItems(await response.text());
  } catch {
    // Honest empty state: the UI links ff.garena.com when mirroring fails.
    return [];
  }
}

/** Posts that announce live/upcoming in-game events and collab campaigns. */
export function officialEventItems(news: OfficialNewsItem[]): OfficialNewsItem[] {
  return news.filter((item) => EVENT_CATEGORIES.has(item.category));
}
