"use client";

import { useState } from "react";
import Link from "next/link";
import type { MeetEvent } from "@/types";
import { Badge } from "@/components/ui/Badge";

const STROKE_COLORS: Record<string, string> = {
  Free: "bg-blue-50 text-blue-700 border-blue-200",
  Back: "bg-purple-50 text-purple-700 border-purple-200",
  Breast: "bg-green-50 text-green-700 border-green-200",
  Fly: "bg-amber-50 text-amber-700 border-amber-200",
  IM: "bg-rose-50 text-rose-700 border-rose-200",
  Relay: "bg-slate-50 text-slate-700 border-slate-200",
  Other: "bg-gray-50 text-gray-700 border-gray-200",
};

interface EventListProps {
  meetId: string;
  events: MeetEvent[];
}

export function EventList({ meetId, events }: EventListProps) {
  const [genderFilter, setGenderFilter] = useState<"all" | "M" | "F">("all");
  const [strokeFilter, setStrokeFilter] = useState<string>("all");

  const strokes = Array.from(new Set(events.map((e) => e.stroke)));

  const filtered = events.filter((e) => {
    if (genderFilter !== "all" && e.gender !== genderFilter && e.gender !== "Mixed") return false;
    if (strokeFilter !== "all" && e.stroke !== strokeFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {(["all", "F", "M"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                genderFilter === g
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {g === "all" ? "All" : g === "F" ? "Women" : "Men"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setStrokeFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              strokeFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All strokes
          </button>
          {strokes.map((s) => (
            <button
              key={s}
              onClick={() => setStrokeFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                strokeFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No events match the filters.</p>
        )}
        {filtered.map((event, idx) => (
          <Link
            key={`${event.id}-${event.name}-${idx}`}
            href={`/meet/${meetId}/event/${event.id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            <span className="text-xs font-mono text-slate-400 w-6 text-right shrink-0">
              {event.number || ""}
            </span>
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                STROKE_COLORS[event.stroke] || STROKE_COLORS.Other
              }`}
            >
              {event.stroke}
            </span>
            <span className="flex-1 text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
              {event.name}
            </span>
            <svg
              className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
