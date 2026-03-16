import { Skeleton } from "@/components/ui/skeleton";

export default function ProfessionalProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-32" />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row">
            <Skeleton className="h-32 w-32 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>

          {/* Availability */}
          <div>
            <Skeleton className="h-6 w-48" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <Skeleton className="h-6 w-24" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Booking card skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border bg-card p-6">
            <Skeleton className="mx-auto h-8 w-24" />
            <Skeleton className="my-6 h-px w-full" />
            <Skeleton className="h-5 w-32" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-12 rounded-lg" />
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
