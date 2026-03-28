/** Parse swim time string to milliseconds. Handles "1:23.45", "23.45", "NT", "–" etc. */
export function parseTimeToMs(raw: string): number {
  const s = raw.trim().replace(/[–\-]/, "");
  if (!s || s === "NT" || s === "DQ" || s === "DNS") return 0;

  const match = s.match(/^(?:(\d+):)?(\d+)\.(\d+)$/);
  if (!match) return 0;

  const minutes = match[1] ? parseInt(match[1]) : 0;
  const seconds = parseInt(match[2]);
  const hundredths = match[3].padEnd(2, "0").slice(0, 2);

  return minutes * 60 * 1000 + seconds * 1000 + parseInt(hundredths) * 10;
}

/** Format milliseconds back to "M:SS.hh" or "SS.hh" */
export function formatTime(ms: number): string {
  if (!ms) return "–";
  const totalSeconds = Math.floor(ms / 1000);
  const hundredths = Math.round((ms % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const secStr = seconds.toString().padStart(minutes > 0 ? 2 : 1, "0");
  const hundStr = hundredths.toString().padStart(2, "0");

  return minutes > 0
    ? `${minutes}:${secStr}.${hundStr}`
    : `${secStr}.${hundStr}`;
}

/** Format ISO date string to readable "Mar 27, 2026" */
export function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** "March 8, 2024" → "2024-03-08" */
export function normalizeDate(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toISOString().slice(0, 10);
  } catch {
    return raw;
  }
}

/** Returns true if the date is within the last N hours */
export function isWithinHours(dateStr: string, hours: number): boolean {
  const d = new Date(dateStr).getTime();
  return d >= Date.now() - hours * 60 * 60 * 1000;
}
