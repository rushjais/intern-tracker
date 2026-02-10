export function DashboardSkeleton() {
  return (
    <div className="min-h-svh bg-background animate-in fade-in duration-300">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
              <div className="flex flex-col gap-1.5">
                <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-36 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
              <div className="h-8 w-20 rounded-md bg-muted animate-pulse" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-muted animate-pulse" />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-6 w-12 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Filter bar skeleton */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-9 flex-1 rounded-md bg-muted animate-pulse" />
            <div className="h-9 w-full sm:w-[160px] rounded-md bg-muted animate-pulse" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 border-b border-border px-4 py-3">
              {["w-24", "w-32", "w-16", "w-16", "w-20", "w-20", "w-8"].map(
                (w, i) => (
                  <div
                    key={i}
                    className={`h-3 ${w} rounded bg-muted animate-pulse`}
                  />
                )
              )}
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border last:border-0 px-4 py-3.5"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-5 w-16 rounded-md bg-muted animate-pulse" />
                <div className="h-5 w-14 rounded-md bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-7 w-7 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
