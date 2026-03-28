import { cn } from "@/lib/utils/format";
import type { CourseType, MeetStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    muted: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function CourseBadge({ course }: { course: CourseType }) {
  const labels: Record<CourseType, string> = {
    SCY: "SCY",
    SCM: "SCM",
    LCM: "LCM",
  };
  return <Badge variant="info">{labels[course]}</Badge>;
}

export function StatusBadge({ status }: { status: MeetStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live
      </span>
    );
  }
  if (status === "recent") return <Badge variant="success">Completed</Badge>;
  if (status === "upcoming") return <Badge variant="warning">Upcoming</Badge>;
  return <Badge variant="muted">Past</Badge>;
}
