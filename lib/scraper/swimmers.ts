import * as cheerio from "cheerio";
import { fetchPageWithRevalidate } from "./http";
import { cache } from "./cache";
import type { Swimmer, SwimmerProfile, SwimmerResult, BestTime } from "@/types";
import { parseTimeToMs } from "@/lib/utils/time";

const BASE = "https://www.swimcloud.com";

/** Search swimmers using SwimCloud's internal search API */
export async function searchSwimmers(query: string): Promise<Swimmer[]> {
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = cache.get<Swimmer[]>(cacheKey);
  if (cached) return cached;

  const url = `${BASE}/api/search/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 120 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const swimmers: Swimmer[] = (data as Array<Record<string, unknown>>)
    .filter((item) => item.doc_type === "Swimmers")
    .map((item) => {
      const urlStr = String(item.url || "");
      const idMatch = urlStr.match(/\/swimmer\/(\d+)/);
      return {
        id: idMatch?.[1] || String(item.id || "").replace("swimmer.", ""),
        name: String(item.name || item.primary_text || ""),
        team: String(item.team || ""),
        location: String(item.location || ""),
      };
    })
    .filter((s) => s.id && s.name);

  cache.set(cacheKey, swimmers, 2 * 60 * 1000);
  return swimmers;
}

/** Scrape swimmer profile and recent meet results (SSR pages) */
export async function scrapeSwimmerProfile(swimmerId: string): Promise<SwimmerProfile> {
  const cacheKey = `swimmer_${swimmerId}`;
  const cached = cache.get<SwimmerProfile>(cacheKey);
  if (cached) return cached;

  // Fetch both pages in parallel
  const [profileHtml, meetsHtml] = await Promise.all([
    fetchPageWithRevalidate(`${BASE}/swimmer/${swimmerId}/`, 60),
    fetchPageWithRevalidate(`${BASE}/swimmer/${swimmerId}/meets/`, 60),
  ]);

  // Parse profile page
  const $p = cheerio.load(profileHtml);

  let name = "";
  let team = "";
  let location = "";
  let avatarUrl: string | undefined;

  // JSON-LD
  const ldJson = $p('script[type="application/ld+json"]').first().text();
  if (ldJson) {
    try {
      const ld = JSON.parse(ldJson);
      name = ld.name || "";
      location = ld.homeLocation
        ? `${ld.homeLocation.addressLocality || ""}, ${ld.homeLocation.addressRegion || ""}`.replace(/^, |, $/, "")
        : "";
      avatarUrl = ld.image;
    } catch { /* ignored */ }
  }

  // HTML fallbacks
  if (!name) name = $p("h1.c-toolbar__title span").first().text().trim();
  if (!name) name = $p("h1.c-toolbar__title").text().trim();

  const teamLink = $p(".c-toolbar__meta a[href*='/team/']").first();
  if (teamLink.length) team = teamLink.text().trim();
  if (!team) {
    $p("a[href*='/team/']").each((_, el) => {
      if (!team) team = $p(el).text().trim();
    });
  }

  if (!location) {
    const locLi = $p(".c-toolbar__meta .o-list-inline li").first();
    location = locLi.text().trim();
  }

  if (!avatarUrl) {
    const img = $p('img[alt*="profile image"], img.c-profile__img').first();
    avatarUrl = img.attr("src");
  }

  // Parse meets page for recent results
  const $m = cheerio.load(meetsHtml);
  const recentResults: SwimmerResult[] = [];

  // Each meet is a section with an h3 header and a table
  // Find all h3 + table pairs
  $m("h3").each((_, h3El) => {
    const meetName = $m(h3El).text().trim();
    // Get the date from the nearby sibling
    const dateEl = $m(h3El).nextAll("p, .u-color-mute").first();
    const dateText = dateEl.text().trim();

    // Find the meet ID from links in the following table
    const nextTable = $m(h3El).nextAll("table").first();
    let meetId = "";
    const meetLink = $m(h3El).nextAll().find('a[href*="/results/"]').first();
    const meetHref = meetLink.attr("href") || "";
    const meetIdMatch = meetHref.match(/\/results\/(\d+)\//);
    if (meetIdMatch) meetId = meetIdMatch[1];

    if (!nextTable.length || !meetId) return;

    nextTable.find("tbody tr").each((_, row) => {
      const cells = $m(row).find("td");
      if (cells.length < 2) return;

      const eventText = $m(cells[0]).text().trim().split("\n")[0].trim();
      const timeLink = $m(row).find('a[href*="/event/"]');
      const time = timeLink.text().trim();
      const placeText = $m(cells).last().text().trim();
      const placeMatch = placeText.match(/(\d+)/);
      const place = placeMatch ? parseInt(placeMatch[1]) : undefined;

      if (!time || !eventText) return;

      // Parse course from event text (e.g., "50 Y Fly" → SCY)
      const courseMatch = eventText.match(/\b([YMS])\b/);
      const course = courseMatch
        ? courseMatch[1] === "Y" ? "SCY" : courseMatch[1] === "M" ? "SCM" : "LCM"
        : "SCY";

      recentResults.push({
        meetId,
        meetName,
        date: dateText,
        event: eventText,
        course,
        time,
        timeMs: parseTimeToMs(time),
        place,
      });
    });
  });

  // Derive best times: best time per event
  const bestTimesMap = new Map<string, BestTime>();
  for (const r of recentResults) {
    const key = `${r.event}_${r.course}`;
    const existing = bestTimesMap.get(key);
    if (!existing || r.timeMs < existing.timeMs) {
      bestTimesMap.set(key, {
        event: r.event,
        course: r.course,
        time: r.time,
        timeMs: r.timeMs,
        meetName: r.meetName,
        date: r.date,
      });
    }
  }
  const bestTimes = Array.from(bestTimesMap.values()).sort(
    (a, b) => a.event.localeCompare(b.event)
  );

  const profile: SwimmerProfile = {
    id: swimmerId,
    name,
    team,
    location,
    avatarUrl,
    recentResults: recentResults.slice(0, 50),
    bestTimes,
  };

  cache.set(cacheKey, profile, 60 * 1000);
  return profile;
}
