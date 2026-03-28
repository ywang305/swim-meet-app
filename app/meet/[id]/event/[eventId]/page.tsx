import { Suspense } from "react";
import Link from "next/link";
import { scrapeEventResults } from "@/lib/scraper/events";
import { scrapeMeetDetail } from "@/lib/scraper/meets";
import { LiveEventResults } from "@/components/events/LiveEventResults";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { MeetStatus } from "@/types";

interface EventPageProps {
  params: Promise<{ id: string; eventId: string }>;
}

async function EventContent({
  meetId,
  eventId,
}: {
  meetId: string;
  eventId: string;
}) {
  let results;
  let meetStatus: MeetStatus = "past";
  try {
    // Fetch event results and meet status in parallel; meet detail is cached so no extra latency
    const [eventResults, meet] = await Promise.all([
      scrapeEventResults(meetId, eventId),
      scrapeMeetDetail(meetId).catch(() => null),
    ]);
    results = eventResults;
    meetStatus = meet?.status ?? "past";
  } catch (err) {
    return (
      <ErrorMessage
        message={err instanceof Error ? err.message : "Failed to load results"}
        swimcloudUrl={`https://www.swimcloud.com/results/${meetId}/event/${eventId}/`}
      />
    );
  }

  return (
    <div>
      {/* Event header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
              Event {eventId}
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              {results.event.name || `Event ${eventId}`}
            </h1>
            {results.meetName && (
              <Link
                href={`/meet/${meetId}`}
                className="text-sm text-blue-500 hover:underline mt-1 block"
              >
                {results.meetName}
              </Link>
            )}
          </div>
          <a
            href={`https://www.swimcloud.com/results/${meetId}/event/${eventId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            SwimCloud →
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          {results.totalEntries}{" "}
          {results.totalEntries === 1 ? "entry" : "entries"}
        </p>
      </div>

      {/* Results — client component handles live polling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <LiveEventResults
          initialResults={results}
          meetId={meetId}
          eventId={eventId}
          meetStatus={meetStatus}
        />
      </div>
    </div>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const { id, eventId } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/meet/${id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to meet
      </Link>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <EventContent meetId={id} eventId={eventId} />
      </Suspense>
    </div>
  );
}
