"use client";

import { useState, useEffect } from "react";

interface LastUpdatedProps {
  timestamp: number;
  isSyncing: boolean;
  isLive: boolean;
}

export function LastUpdated({ timestamp, isSyncing, isLive }: LastUpdatedProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const tick = () =>
      setSecondsAgo(Math.floor((Date.now() - timestamp) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  if (!isLive) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      {isSyncing ? (
        <span className="flex items-center gap-1 text-blue-500">
          <svg
            className="w-3 h-3 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Syncing…
        </span>
      ) : (
        <span>Updated {secondsAgo}s ago</span>
      )}
    </div>
  );
}
