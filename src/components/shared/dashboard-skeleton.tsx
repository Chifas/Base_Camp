import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="mt-2 h-8 w-20" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SessionRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SessionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
      <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}
