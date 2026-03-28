import Link from "next/link";
import type { Meet } from "@/types";
import { StatusBadge, CourseBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/time";

export function MeetCard({ meet }: { meet: Meet }) {
  const dateStr =
    meet.startDate === meet.endDate
      ? formatDate(meet.startDate)
      : `${formatDate(meet.startDate)} – ${formatDate(meet.endDate)}`;

  const isLive = meet.status === "live";

  return (
    <Link
      href={`/meet/${meet.id}`}
      className={`block rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-4 ${
        isLive
          ? "border-l-4 border-l-emerald-400 border border-slate-200"
          : "border border-slate-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
            {meet.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{dateStr}</p>
          {meet.location && (
            <p className="text-xs text-slate-500 truncate">{meet.location}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={meet.status} />
          <CourseBadge course={meet.course} />
        </div>
      </div>
    </Link>
  );
}

export function MeetCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/3 mb-1" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  );
}
