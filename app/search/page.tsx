import { Suspense } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { SwimmerCard } from "@/components/swimmer/SwimmerCard";
import { MeetCard } from "@/components/meets/MeetCard";
import { LoadingRows } from "@/components/ui/LoadingSpinner";
import { searchSwimmers } from "@/lib/scraper/swimmers";
import { scrapeRecentMeets } from "@/lib/scraper/meets";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

async function SearchResults({ q, type }: { q: string; type: string }) {
  const [swimmers, allMeets] = await Promise.all([
    type === "meet" ? [] : searchSwimmers(q),
    type === "swimmer" ? [] : scrapeRecentMeets(7 * 24),
  ]);

  const meets =
    type === "swimmer"
      ? []
      : allMeets.filter((m) =>
          m.name.toLowerCase().includes(q.toLowerCase())
        );

  const showBoth = type === "all" || (!type);
  const showSwimmers = type !== "meet";
  const showMeets = type !== "swimmer";

  return (
    <div>
      {showBoth ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Swimmers column */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Swimmers ({swimmers.length})
            </h2>
            {swimmers.length === 0 ? (
              <p className="text-sm text-slate-400">No swimmers found.</p>
            ) : (
              <div className="space-y-2">
                {swimmers.slice(0, 15).map((s) => (
                  <SwimmerCard key={s.id} swimmer={s} />
                ))}
              </div>
            )}
          </section>

          {/* Meets column */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Recent Meets ({meets.length})
            </h2>
            {meets.length === 0 ? (
              <p className="text-sm text-slate-400">No recent meets found.</p>
            ) : (
              <div className="space-y-2">
                {meets.slice(0, 10).map((m) => (
                  <MeetCard key={m.id} meet={m} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div>
          {showSwimmers && (
            <div className="space-y-2">
              {swimmers.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No swimmers found for "{q}".</p>
              ) : (
                swimmers.slice(0, 20).map((s) => <SwimmerCard key={s.id} swimmer={s} />)
              )}
            </div>
          )}
          {showMeets && (
            <div className="space-y-2">
              {meets.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No meets found for "{q}".</p>
              ) : (
                meets.slice(0, 10).map((m) => <MeetCard key={m.id} meet={m} />)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", type = "all" } = await searchParams;
  const query = q.trim();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBar defaultValue={query} placeholder="Search swimmer or meet name..." />
      </div>

      {!query || query.length < 2 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">🔍</p>
          <p>Enter a swimmer name or meet to search</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-6">
            Results for <span className="font-medium text-slate-800">"{query}"</span>
          </p>
          <Suspense
            fallback={
              <div className="space-y-4">
                <LoadingRows count={6} />
              </div>
            }
          >
            <SearchResults q={query} type={type} />
          </Suspense>
        </>
      )}
    </div>
  );
}
