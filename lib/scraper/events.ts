import * as cheerio from "cheerio";
import { fetchPageWithRevalidate } from "./http";
import { cache } from "./cache";
import type { EventResults, Heat, HeatEntry, EntryStatus, MeetEvent, CourseType } from "@/types";
import { parseTimeToMs } from "@/lib/utils/time";

const BASE = "https://www.swimcloud.com";

function parseEntryStatus(text: string): EntryStatus {
  const t = text.trim().toUpperCase();
  if (t === "DNS") return "DNS";
  if (t === "DQ") return "DQ";
  if (t === "SCR" || t === "SCRATCH") return "Scratch";
  if (!t || t === "–" || t === "-") return "unknown";
  return "finished";
}

/** Parse a single results table into a list of HeatEntry rows */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseResultsTable($: cheerio.CheerioAPI, table: any): HeatEntry[] {
  const entries: HeatEntry[] = [];
  let overallPlace = 0;

  $(table).find("tbody tr").each((rowIdx, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    // Place is first td
    const placeText = $(cells[0]).text().trim().replace(/[–\-]/, "").trim();
    const place = parseInt(placeText) || (rowIdx + 1);
    if (parseInt(placeText)) overallPlace = parseInt(placeText);

    // Swimmer name and ID from link
    const swimmerLink = $(row).find('a[href*="/swimmer/"]');
    const swimmerHref = swimmerLink.attr("href") || "";
    const swimmerIdMatch = swimmerHref.match(/\/swimmer\/(\d+)\//);
    const swimmerId = swimmerIdMatch?.[1];
    const swimmerName = swimmerLink.text().trim();

    if (!swimmerName) return; // skip relay/header rows

    // Team name — second td or td.hidden-xs
    let team = "";
    const teamLink = $(row).find('a[href*="/team/"]').first();
    if (teamLink.length) {
      team = teamLink.text().trim();
    } else {
      // Team text in hidden-xs td (3rd column after name)
      team = $(cells[2]).text().trim();
    }

    // Time — td with u-text-end u-nowrap u-text-semi
    const timeCell = $(row).find("td.u-text-end.u-nowrap");
    let finalTime: string | undefined;
    let timeMs: number | undefined;
    let status: EntryStatus = "unknown";

    if (timeCell.length) {
      const timeLink = timeCell.find('a[href*="/times/"]');
      if (timeLink.length) {
        finalTime = timeLink.text().trim();
        timeMs = parseTimeToMs(finalTime);
        status = "finished";
      } else {
        const rawText = timeCell.text().trim();
        status = parseEntryStatus(rawText);
        if (status !== "finished") finalTime = undefined;
      }
    }

    // Lane — not always present in results, skip for now
    const lane = 0;

    entries.push({
      place: parseInt(placeText) || rowIdx + 1,
      lane,
      swimmerName,
      swimmerId,
      team,
      finalTime,
      timeMs,
      status,
    });
  });

  return entries;
}

/** Scrape event results page — SSR, fully reliable */
export async function scrapeEventResults(
  meetId: string,
  eventId: string,
  meetName = ""
): Promise<EventResults> {
  const cacheKey = `event_${meetId}_${eventId}`;
  const cached = cache.get<EventResults>(cacheKey);
  if (cached) return cached;

  const html = await fetchPageWithRevalidate(
    `${BASE}/results/${meetId}/event/${eventId}/`,
    15
  );
  const $ = cheerio.load(html);

  // Get event name from page title / toolbar
  const pageTitle = $("title").text().trim();
  const meetH1 = $("h1.c-toolbar__title").text().trim();

  // Parse each table (one per round: Prelims, Finals, Timed Finals)
  const heats: Heat[] = [];
  $("table.c-table-clean, table").each((tableIdx, table) => {
    const caption = $(table).find("caption").text().trim();
    const entries = parseResultsTable($, table);
    if (entries.length > 0) {
      heats.push({
        heatNumber: tableIdx + 1,
        entries,
      });
    }
  });

  // Sort entries within each heat by time ascending (fastest first), non-finishers last
  heats.forEach((heat) => {
    heat.entries.sort((a, b) => {
      if (a.status === "finished" && b.status === "finished") {
        return (a.timeMs || 0) - (b.timeMs || 0);
      }
      if (a.status === "finished") return -1;
      if (b.status === "finished") return 1;
      return 0;
    });
    // Update place after sort
    let place = 1;
    heat.entries.forEach((e) => {
      if (e.status === "finished") {
        e.place = place++;
      }
    });
  });

  // Extract event name from sidebar: look specifically for .c-events__link that links to this event
  let eventName = "";
  $(`.c-events__link[href*="/results/${meetId}/event/${eventId}/"]`).each((_, el) => {
    const title = $(el).find(".c-events__link-body").attr("title") || "";
    if (title) { eventName = title; return false; } // break on first match
  });
  // Fallback: page title format is "MeetName - EventName" — take everything after last " - "
  if (!eventName) {
    const dashIdx = pageTitle.lastIndexOf(" - ");
    eventName = dashIdx > 0 ? pageTitle.slice(dashIdx + 3).trim() : pageTitle;
  }

  const totalEntries = heats.reduce((sum, h) => sum + h.entries.length, 0);

  const event: MeetEvent = {
    id: eventId,
    number: parseInt(eventId) || 0,
    name: eventName,
    stroke: "Free",
    distance: 0,
    gender: "Mixed",
    course: "SCY",
  };

  const result: EventResults = {
    meetId,
    meetName: meetName || meetH1,
    event,
    heats,
    totalEntries,
  };

  cache.set(cacheKey, result, 15 * 1000);
  return result;
}
