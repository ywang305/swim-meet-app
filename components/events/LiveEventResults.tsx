"use client";

import { useState, useCallback } from "react";
import type { EventResults, MeetStatus } from "@/types";
import { ResultsTable } from "./ResultsTable";
import { useLivePolling } from "@/components/ui/useLivePolling";
import { LastUpdated } from "@/components/ui/LastUpdated";

interface LiveEventResultsProps {
  initialResults: EventResults;
  meetId: string;
  eventId: string;
  meetStatus: MeetStatus;
}

export function LiveEventResults({
  initialResults,
  meetId,
  eventId,
  meetStatus,
}: LiveEventResultsProps) {
  const [results, setResults] = useState<EventResults>(initialResults);
  const isLive = meetStatus === "live";

  const handleData = useCallback((data: EventResults) => {
    setResults(data);
  }, []);

  const { lastUpdatedAt, isSyncing, error } = useLivePolling<EventResults>({
    url: `/api/meet/${meetId}/event/${eventId}`,
    intervalMs: 30_000,
    isLive,
    onData: handleData,
  });

  return (
    <div>
      {isLive && (
        <div className="flex items-center justify-between mb-3">
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
      {results.heats.length > 1 && (
        <p className="text-xs text-slate-400 mb-4">
          {results.heats.length} rounds — showing combined results sorted by time
        </p>
      )}
      <ResultsTable heats={results.heats} meetId={meetId} />
    </div>
  );
}
