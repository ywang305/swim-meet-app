import { Suspense } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { MeetCard, MeetCardSkeleton } from "@/components/meets/MeetCard";
import { scrapeRecentMeets } from "@/lib/scraper/meets";
import type { Meet } from "@/types";

async function LiveMeetsStrip() {
  let meets: Meet[] = [];
  try {
    meets = await scrapeRecentMeets(24);
  } catch {
    // silently degrade
  }

  if (!meets.length) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        No recent meets found.{" "}
        <a
          href="https://www.swimcloud.com/results/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Browse on SwimCloud →
        </a>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {meets.slice(0, 6).map((meet) => (
        <MeetCard key={meet.id} meet={meet} />
      ))}
    </div>
  );
}

function LiveMeetsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <MeetCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-slate-50 -mx-4 px-4 pt-12 pb-10 mb-10 text-center rounded-b-2xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Live Swim Results
        </h1>
        <p className="text-slate-500 text-base mb-8">
          Search swimmers by name or browse current meet results
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar autoFocus placeholder="Search swimmer or meet name..." />
        </div>
      </section>

      {/* Recent Meets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-700">
            Recent & Live Meets
          </h2>
          <a href="/meets" className="text-sm text-blue-600 hover:underline">
            See all →
          </a>
        </div>
        <Suspense fallback={<LiveMeetsSkeleton />}>
          <LiveMeetsStrip />
        </Suspense>
      </div>
    </div>
  );
}
