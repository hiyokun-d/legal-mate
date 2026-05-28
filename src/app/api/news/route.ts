import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

let cache: { data: NewsItem[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

function parseRSSItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];

    const titleRaw =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ??
      item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
      "";

    const link =
      item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";

    const pubDate =
      item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ??
      new Date().toUTCString();

    const source =
      item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() ??
      item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1]?.trim() ??
      "Media";

    const title = titleRaw
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (!title) continue;

    
    const cleanTitle = title.replace(/\s*-\s*[^-]+$/, "").trim() || title;
    const cleanSource = source.replace(/<!\[CDATA\[|\]\]>/g, "").trim();

    items.push({ title: cleanTitle, link, pubDate, source: cleanSource || "Berita" });
  }

  return items;
}

async function fetchQuery(query: string): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LegalMateNewsBot/1.0; +https://legal-mate.app)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRSSItems(xml);
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { "X-Cache": "HIT", "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  }

  try {
    const queries = [
      "penipuan kontrak bisnis Indonesia 2025",
      "modus scam UMKM surat perjanjian",
      "waspada penipuan investasi Indonesia terbaru",
    ];

    const settled = await Promise.allSettled(queries.map(fetchQuery));
    const all = settled
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    const seen = new Set<string>();
    const deduped = all.filter(({ title }) => {
      if (seen.has(title)) return false;
      seen.add(title);
      return true;
    });

    deduped.sort((a, b) => {
      const da = new Date(a.pubDate).getTime();
      const db = new Date(b.pubDate).getTime();
      return isNaN(da) || isNaN(db) ? 0 : db - da;
    });

    const data = deduped.slice(0, 15);
    cache = { data, ts: Date.now() };
    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS", "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    const fallback = cache?.data ?? [];
    return NextResponse.json(fallback);
  }
}
