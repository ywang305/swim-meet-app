"use client";

import { useState, useCallback } from "react";
import type { Meet } from "@/types";
import { MeetCard } from "@/components/meets/MeetCard";
import { useLivePolling } from "@/components/ui/useLivePolling";
import { LastUpdated } from "@/components/ui/LastUpdated";

interface LiveMeetsListProps {
  initialMeets: Meet[];
}

export function LiveMeetsList({ initialMeets }: LiveMeetsListProps) {
  const [meets, setMeets] = useState<Meet[]>(initialMeets);

  // Only poll when at least one meet is currently live
  const hasLive = meets.some((m) => m.status === "live");

  const handleData = useCallback((data: Meet[]) => {
    setMeets(data);
  }, []);

  const { lastUpdatedAt, isSyncing } = useLivePolling<Meet[]>({
    url: `/api/meets?hours=168`,
    intervalMs: 2 * 60 * 1000, // 2 minutes
    isLive: hasLive,
    onData: handleData,
  });

  const live = meets.filter((m) => m.status === "live");
  const recent = meets.filter((m) => m.status !== "live");

  if (!meets.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="mb-3">No meets found in the last 7 days.</p>
        <a
          href="https://www.swimcloud.com/results/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          Browse all meets on SwimCloud →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasLive && (
        <div className="flex justify-end">
          <LastUpdated timestamp={lastUpdatedAt} isSyncing={isSyncing} isLive={hasLive} />
        </div>
      )}
      {live.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
            In Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {live.map((meet) => (
              <MeetCard key={meet.id} meet={meet} />
            ))}
          </div>
        </section>
      )}
      {recent.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recent
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recent.map((meet) => (
              <MeetCard key={meet.id} meet={meet} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
