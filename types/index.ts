// ─── Union types ──────────────────────────────────────────────────────────────

export type CourseType = "SCY" | "SCM" | "LCM";
export type MeetStatus = "live" | "recent" | "upcoming" | "past";
export type StrokeType = "Free" | "Back" | "Breast" | "Fly" | "IM" | "Relay" | "Other";
export type EntryStatus = "finished" | "DNS" | "DQ" | "Scratch" | "unknown";

// ─── Swimmer types ────────────────────────────────────────────────────────────

export interface Swimmer {
  id: string;
  name: string;
  team: string;
  teamId?: string;
  age?: number;
  gender?: "M" | "F";
  location?: string;
  avatarUrl?: string;
}

export interface BestTime {
  event: string;
  course: CourseType;
  time: string;
  timeMs: number;
  meetName?: string;
  date?: string;
}

export interface SwimmerResult {
  meetId: string;
  meetName: string;
  date: string;
  event: string;
  course: CourseType;
  time: string;
  timeMs: number;
  place?: number;
  isPersonalBest?: boolean;
}

export interface SwimmerProfile extends Swimmer {
  recentResults: SwimmerResult[];
  bestTimes: BestTime[];
}

// ─── Meet types ───────────────────────────────────────────────────────────────

export interface Meet {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  city?: string;
  state?: string;
  course: CourseType;
  status: MeetStatus;
  url: string;
  eventCount?: number;
}

export interface MeetEvent {
  id: string;
  number: number;
  name: string;
  stroke: StrokeType;
  distance: number;
  gender: "M" | "F" | "Mixed";
  ageGroup?: string;
  course: CourseType;
}

export interface MeetDetail extends Meet {
  events: MeetEvent[];
  organizerName?: string;
}

// ─── Results types ────────────────────────────────────────────────────────────

export interface HeatEntry {
  place: number;
  heatPlace?: number;
  lane: number;
  swimmerName: string;
  swimmerId?: string;
  team: string;
  seedTime?: string;
  finalTime?: string;
  timeMs?: number;
  splits?: string[];
  status: EntryStatus;
  isPersonalBest?: boolean;
}

export interface Heat {
  heatNumber: number;
  entries: HeatEntry[];
}

export interface EventResults {
  meetId: string;
  meetName: string;
  event: MeetEvent;
  heats: Heat[];
  totalEntries: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResults {
  swimmers: Swimmer[];
  meets: Meet[];
  query: string;
  timestamp: number;
}

// ─── API wrapper ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
  cached: boolean;
  fetchedAt: number;
}
