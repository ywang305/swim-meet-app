import Link from "next/link";
import type { Heat } from "@/types";
import { ordinal } from "@/lib/utils/format";

interface ResultsTableProps {
  heats: Heat[];
  meetId: string;
}

export function ResultsTable({ heats, meetId }: ResultsTableProps) {
  if (!heats.length) {
    return <p className="text-sm text-slate-400 text-center py-8">No results available yet.</p>;
  }

  // Flatten all entries and sort by time for overall rank
  const allFinished = heats
    .flatMap((h) => h.entries)
    .filter((e) => e.status === "finished" && e.timeMs)
    .sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));

  const allNonFinished = heats
    .flatMap((h) => h.entries)
    .filter((e) => e.status !== "finished");

  const allEntries = [...allFinished, ...allNonFinished];

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left pb-3 pr-4 text-xs font-medium text-slate-400 w-10">#</th>
            <th className="text-left pb-3 pr-4 text-xs font-medium text-slate-400">Swimmer</th>
            <th className="text-left pb-3 pr-4 text-xs font-medium text-slate-400 hidden sm:table-cell">Team</th>
            <th className="text-right pb-3 text-xs font-medium text-slate-400">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {allEntries.map((entry, idx) => (
            <tr
              key={`${entry.swimmerName}-${idx}`}
              className={`hover:bg-slate-50 transition-colors ${
                entry.status !== "finished" ? "opacity-50" : ""
              }`}
            >
              <td className="py-3 pr-4 text-xs text-slate-400 font-mono">
                {entry.status === "finished" ? idx + 1 : ""}
              </td>
              <td className="py-3 pr-4">
                {entry.swimmerId ? (
                  <Link
                    href={`/swimmer/${entry.swimmerId}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {entry.swimmerName}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-900">{entry.swimmerName}</span>
                )}
                <div className="text-xs text-slate-400 sm:hidden">{entry.team}</div>
              </td>
              <td className="py-3 pr-4 text-slate-500 hidden sm:table-cell">{entry.team}</td>
              <td className="py-3 text-right">
                {entry.status === "finished" ? (
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {entry.finalTime}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400 uppercase">
                    {entry.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
