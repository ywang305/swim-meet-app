"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseLivePollingOptions<T> {
  /** API route URL to fetch */
  url: string;
  /** Polling interval in milliseconds */
  intervalMs: number;
  /** When false, polling is entirely disabled */
  isLive: boolean;
  /** Called with fresh data on each successful poll */
  onData: (data: T) => void;
}

export function useLivePolling<T>({
  url,
  intervalMs,
  isLive,
  onData,
}: UseLivePollingOptions<T>) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep refs so the poll callback never stales out
  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  const poll = useCallback(async () => {
    if (!isLiveRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;

    setIsSyncing(true);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.data) {
        onDataRef.current(json.data);
        setLastUpdatedAt(Date.now());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setIsSyncing(false);
    }
  }, [url]); // url is the only external dep; refs handle the rest

  useEffect(() => {
    if (!isLive) return;

    const timerId = setInterval(poll, intervalMs);

    // Poll immediately when tab regains focus
    const handleVisibility = () => {
      if (!document.hidden && isLiveRef.current) {
        poll();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isLive, intervalMs, poll]);

  return { lastUpdatedAt, isSyncing, error, manualPoll: poll };
}
