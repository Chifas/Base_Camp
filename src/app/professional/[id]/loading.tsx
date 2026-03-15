import { Skeleton } from "@/components/ui/skeleton";

export default function ProfessionalProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Skeleton className="h-28 w-28 rounded-full" />
        <div className="flex-1 text-center sm:text-left">
          <Skeleton className="mx-auto h-8 w-48 sm:mx-0" />
          <Skeleton className="mx-auto mt-2 h-5 w-32 sm:mx-0" />
          <Skeleton className="mx-auto mt-2 h-4 w-64 sm:mx-0" />
          <div className="mt-4 flex justify-center gap-4 sm:justify-start">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-12 w-36 rounded-lg" />
      </div>

      {/* Bio */}
      <div className="mt-8">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
