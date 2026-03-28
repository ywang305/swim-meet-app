import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { scrapeSwimmerProfile } from "@/lib/scraper/swimmers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/time";

interface SwimmerPageProps {
  params: Promise<{ id: string }>;
}

async function SwimmerContent({ id }: { id: string }) {
  let profile;
  try {
    profile = await scrapeSwimmerProfile(id);
  } catch (err) {
    return (
      <ErrorMessage
        message={err instanceof Error ? err.message : "Failed to load swimmer"}
        swimcloudUrl={`https://www.swimcloud.com/swimmer/${id}/`}
      />
    );
  }

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              width={64}
              height={64}
              className="rounded-full object-cover h-16 w-16"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {profile.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
            {profile.team && (
              <p className="text-sm text-slate-600">{profile.team}</p>
            )}
            {profile.location && (
              <p className="text-xs text-slate-400">{profile.location}</p>
            )}
          </div>
        </div>
        <a
          href={`https://www.swimcloud.com/swimmer/${id}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-blue-500 hover:underline"
        >
          Full profile on SwimCloud →
        </a>
      </div>

      {/* Best times */}
      {profile.bestTimes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Best Times</h2>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-xs font-medium text-slate-400">Event</th>
                  <th className="text-right pb-2 text-xs font-medium text-slate-400">Time</th>
                  <th className="text-right pb-2 text-xs font-medium text-slate-400 hidden sm:table-cell">Meet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profile.bestTimes.map((bt, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 pr-4">
                      <span className="text-slate-800">{bt.event}</span>
                      <Badge variant="info" className="ml-2">{bt.course}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {bt.time}
                      </span>
                    </td>
                    <td className="py-2 text-right text-xs text-slate-400 hidden sm:table-cell truncate max-w-[200px]">
                      {bt.meetName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent results */}
      {profile.recentResults.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Results</h2>
          <div className="space-y-4">
            {profile.recentResults.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {r.event}
                    <Badge variant="info" className="ml-2">{r.course}</Badge>
                  </p>
                  <Link
                    href={`/meet/${r.meetId}`}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {r.meetName}
                  </Link>
                  {r.date && (
                    <span className="text-xs text-slate-400 ml-2">{r.date}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-semibold text-slate-900 tabular-nums text-sm">
                    {r.time}
                  </span>
                  {r.place && (
                    <p className="text-xs text-slate-400">{r.place}th</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.recentResults.length === 0 && profile.bestTimes.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500 mb-2">No recent results found.</p>
          <a
            href={`https://www.swimcloud.com/swimmer/${id}/meets/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            View full history on SwimCloud →
          </a>
        </div>
      )}
    </div>
  );
}

export default async function SwimmerPage({ params }: SwimmerPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <SwimmerContent id={id} />
      </Suspense>
    </div>
  );
}
