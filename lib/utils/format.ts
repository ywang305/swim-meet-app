import type { MeetStatus } from "@/types";

export function meetStatusLabel(status: MeetStatus): string {
  switch (status) {
    case "live": return "In Progress";
    case "recent": return "Completed";
    case "upcoming": return "Upcoming";
    case "past": return "Past";
    default: return "";
  }
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
