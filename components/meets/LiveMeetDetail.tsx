"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { MeetDetail } from "@/types";
import { StatusBadge, CourseBadge } from "@/components/ui/Badge";
import { EventList } from "@/components/meets/EventList";
import { useLivePolling } from "@/components/ui/useLivePolling";
import { LastUpdated } from "@/components/ui/LastUpdated";
import { formatDate } from "@/lib/utils/time";

interface LiveMeetDetailProps {
  initialMeet: MeetDetail;
}

export function LiveMeetDetail({ initialMeet }: LiveMeetDetailProps) {
  const [meet, setMeet] = useState<MeetDetail>(initialMeet);
  const isLive = meet.status === "live";

  const handleData = useCallback((data: MeetDetail) => {
    setMeet(data);
  }, []);

  const { lastUpdatedAt, isSyncing, error } = useLivePolling<MeetDetail>({
    url: `/api/meet/${meet.id}`,
    intervalMs: 60_000,
    isLive,
    onData: handleData,
  });

  const dateStr =
    meet.startDate === meet.endDate
      ? formatDate(meet.startDate)
      : `${formatDate(meet.startDate)} – ${formatDate(meet.endDate)}`;

  return (
    <div>
      {/* Meet header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <h1 className="text-xl font-bold text-slate-900">{meet.name}</h1>
          <div className="flex gap-2 shrink-0">
            <StatusBadge status={meet.status} />
            <CourseBadge course={meet.course} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          {dateStr && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateStr}
            </span>
          )}
          {meet.location && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {meet.location}
            </span>
          )}
          {"organizerName" in meet && meet.organizerName && (
            <span>{String(meet.organizerName)}</span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
          <a
            href={`https://www.swimcloud.com/results/${meet.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            View on SwimCloud →
          </a>
          {isLive && (
            <div className="flex items-center gap-2">
              <LastUpdated
                timestamp={lastUpdatedAt}
                isSyncing={isSyncing}
                isLive={isLive}
              />
              {error && (
                <span className="text-xs text-red-400">⚠ {error}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Events */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Events ({meet.events.length})
        </h2>
        {meet.events.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No events found. Results may not be posted yet.
          </p>
        ) : (
          <EventList meetId={meet.id} events={meet.events} />
        )}
      </div>
    </div>
  );
}
