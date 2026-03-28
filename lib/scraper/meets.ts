import * as cheerio from "cheerio";
import { fetchPageWithRevalidate } from "./http";
import { cache } from "./cache";
import type { Meet, MeetDetail, MeetEvent, CourseType, MeetStatus, StrokeType } from "@/types";

const BASE = "https://www.swimcloud.com";

function parseCourse(raw: string): CourseType {
  const s = raw.trim().toUpperCase();
  if (s === "SCY") return "SCY";
  if (s === "SCM") return "SCM";
  if (s === "LCM") return "LCM";
  return "SCY";
}

function parseMeetStatus(statusDisplay: string): MeetStatus {
  const s = statusDisplay.toLowerCase();
  if (s.includes("progress") || s.includes("live")) return "live";
  if (s.includes("complet")) return "recent";
  if (s.includes("upcoming")) return "upcoming";
  return "past";
}

function parseEventName(title: string): {
  stroke: StrokeType;
  distance: number;
  gender: "M" | "F" | "Mixed";
  ageGroup?: string;
} {
  const lower = title.toLowerCase();
  let stroke: StrokeType = "Other";
  if (lower.includes("relay")) stroke = "Relay";
  else if (lower.includes("medley") && !lower.includes("relay")) stroke = "IM";
  else if (lower.includes("im") || lower.includes("individual medley")) stroke = "IM";
  else if (lower.includes("free")) stroke = "Free";
  else if (lower.includes("back")) stroke = "Back";
  else if (lower.includes("breast")) stroke = "Breast";
  else if (lower.includes("fly") || lower.includes("butterfly")) stroke = "Fly";

  const distMatch = title.match(/(\d+)/);
  const distance = distMatch ? parseInt(distMatch[1]) : 0;

  let gender: "M" | "F" | "Mixed" = "Mixed";
  if (lower.includes(" men") || lower.endsWith("men")) gender = "M";
  else if (lower.includes(" women") || lower.endsWith("women")) gender = "F";
  else if (lower.includes(" boys") || lower.endsWith("boys")) gender = "M";
  else if (lower.includes(" girls") || lower.endsWith("girls")) gender = "F";
  else if (lower.includes(" male")) gender = "M";
  else if (lower.includes(" female")) gender = "F";

  const ageMatch = title.match(/(\d+-\d+|\d+&[Oo]ver|\d+\+|open|senior|junior)/i);
  const ageGroup = ageMatch ? ageMatch[1] : undefined;

  return { stroke, distance, gender, ageGroup };
}

/** Fetch recent meets from SwimCloud's internal API (no scraping needed) */
export async function scrapeRecentMeets(hours = 24): Promise<Meet[]> {
  const cacheKey = `meets_${hours}`;
  const cached = cache.get<Meet[]>(cacheKey);
  if (cached) return cached;

  const period = hours <= 7 * 24 ? "past_7" : hours <= 30 * 24 ? "past_30" : "past_365";
  const url = `${BASE}/api/meets/results_page_list/?period=${period}&page_view=regionMeets&order_by=latest&region=country_USA&page=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();

  // Compare by date string to avoid UTC vs local time issues
  // e.g. "2026-03-27" vs today "2026-03-27"
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10); // "YYYY-MM-DD"

  const seenMeetIds = new Set<string>();
  const meets: Meet[] = (data.results || [])
    .filter((m: Record<string, unknown>) => {
      const d = (m.startdate as string)?.slice(0, 10) || "";
      return d >= cutoffStr;
    })
    .map((m: Record<string, unknown>): Meet => ({
      id: String(m.id),
      name: m.display_name as string,
      startDate: m.startdate as string,
      endDate: (m.enddate as string) || (m.startdate as string),
      location: (m.location as string) || "",
      city: (m.location_without_facility as string)?.split(",")[0]?.trim(),
      state: (m.location_without_facility as string)?.split(",")[1]?.trim(),
      course: "SCY", // not in API response, will be scraped from detail
      status: parseMeetStatus((m.status_display as string) || ""),
      url: `${BASE}${m.absolute_url}`,
    }))
    .filter((m: Meet) => {
      if (seenMeetIds.has(m.id)) return false;
      seenMeetIds.add(m.id);
      return true;
    });

  cache.set(cacheKey, meets, 5 * 60 * 1000);
  return meets;
}

/** Scrape meet detail page (SSR — cheerio works reliably) */
export async function scrapeMeetDetail(meetId: string): Promise<MeetDetail> {
  const cacheKey = `meet_${meetId}`;
  const cached = cache.get<MeetDetail>(cacheKey);
  if (cached) return cached;

  const html = await fetchPageWithRevalidate(`${BASE}/results/${meetId}/`, 60);
  const $ = cheerio.load(html);

  // Parse JSON-LD for authoritative metadata
  let name = "";
  let startDate = "";
  let endDate = "";
  let location = "";
  let city = "";
  let state = "";
  let organizerName: string | undefined;

  const ldJson = $('script[type="application/ld+json"]').first().text();
  if (ldJson) {
    try {
      const ld = JSON.parse(ldJson);
      name = ld.name || "";
      startDate = ld.startDate || "";
      endDate = ld.endDate || startDate;
      location = ld.location?.name || "";
      city = ld.location?.address?.addressLocality || "";
      state = ld.location?.address?.addressRegion || "";
      organizerName = ld.organizer?.name;
    } catch {
      // fall through to HTML parsing
    }
  }

  // Fallback from HTML
  if (!name) name = $("#meet-name").text().trim();
  if (!startDate) startDate = $("#meet-date").text().trim();

  const courseText = $("#meet-course").text().trim();
  const course = parseCourse(courseText);

  // Parse events from the sidebar list — deduplicate by eventId+name
  const events: MeetEvent[] = [];
  const seenEventKeys = new Set<string>();
  $(".c-events__link").each((_, el) => {
    const href = $(el).attr("href") || "";
    const eventIdMatch = href.match(/\/results\/\d+\/event\/([^/]+)\//);
    if (!eventIdMatch) return;

    const eventId = eventIdMatch[1];
    const title = $(el).find(".c-events__link-body").attr("title") || "";
    const numberText = $(el).find(".c-event-status").first().text().trim();
    const number = parseInt(numberText) || 0;

    if (!title) return;

    // Deduplicate: same event can appear in multiple sidebar sections
    const key = `${eventId}:${title}`;
    if (seenEventKeys.has(key)) return;
    seenEventKeys.add(key);

    const parsed = parseEventName(title);
    events.push({
      id: eventId,
      number,
      name: title,
      stroke: parsed.stroke,
      distance: parsed.distance,
      gender: parsed.gender,
      ageGroup: parsed.ageGroup,
      course,
    });
  });

  const detail: MeetDetail = {
    id: meetId,
    name,
    startDate,
    endDate,
    location,
    city,
    state,
    course,
    status: "recent",
    url: `${BASE}/results/${meetId}`,
    events,
    organizerName,
    eventCount: events.length,
  };

  cache.set(cacheKey, detail, 30 * 1000);
  return detail;
}
