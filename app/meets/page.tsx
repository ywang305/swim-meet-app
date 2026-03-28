import { Suspense } from "react";
import { MeetCardSkeleton } from "@/components/meets/MeetCard";
import { LiveMeetsList } from "@/components/meets/LiveMeetsList";
import { scrapeRecentMeets } from "@/lib/scraper/meets";
import { SearchBar } from "@/components/ui/SearchBar";
import type { Meet } from "@/types";

async function MeetsList() {
  let meets: Meet[] = [];
  try {
    meets = await scrapeRecentMeets(7 * 24);
  } catch {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600 mb-3">Could not load meets.</p>
        <a
          href="https://www.swimcloud.com/results/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View all meets on SwimCloud →
        </a>
      </div>
    );
  }

  // Pass SSR-fetched meets into the client component for hydration + polling
  return <LiveMeetsList initialMeets={meets} />;
}

function MeetsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <MeetCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function MeetsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="bg-gradient-to-b from-blue-50 to-slate-50 -mx-4 px-4 pt-8 pb-6 mb-6 rounded-b-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Live & Recent Meets
        </h1>
        <SearchBar placeholder="Search meets or swimmers..." />
      </section>
      <Suspense fallback={<MeetsListSkeleton />}>
        <MeetsList />
      </Suspense>
    </div>
  );
}
