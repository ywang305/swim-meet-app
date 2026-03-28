export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 border-t-blue-500`}
      />
    </div>
  );
}

export function LoadingRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-3">
          <div className="h-4 bg-slate-200 rounded flex-1" />
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
