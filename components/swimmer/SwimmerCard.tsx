import Link from "next/link";
import type { Swimmer } from "@/types";

export function SwimmerCard({ swimmer }: { swimmer: Swimmer }) {
  return (
    <Link
      href={`/swimmer/${swimmer.id}`}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all p-4"
    >
      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-semibold text-sm">
        {swimmer.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-slate-900 text-sm truncate">{swimmer.name}</p>
        <p className="text-xs text-slate-500 truncate">{swimmer.team}</p>
        {swimmer.location && (
          <p className="text-xs text-slate-400 truncate">{swimmer.location}</p>
        )}
      </div>
      <svg
        className="w-4 h-4 text-slate-300 ml-auto shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
