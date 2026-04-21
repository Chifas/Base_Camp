export function ExploreSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
        >
          {/* Cover band */}
          <div className="skeleton h-20 w-full" />

          <div className="flex flex-col items-center px-5 pb-4">
            {/* Photo */}
            <div className="skeleton -mt-11 h-[88px] w-[88px] rounded-full ring-4 ring-white dark:ring-stone-900" />
            {/* Name */}
            <div className="skeleton mt-3 h-4 w-32 rounded-full" />
            {/* Specialty */}
            <div className="skeleton mt-2 h-3 w-24 rounded-full" />
            {/* Rating */}
            <div className="skeleton mt-2 h-3 w-20 rounded-full" />
          </div>

          {/* Bio lines */}
          <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-3 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-4/5 mx-auto rounded-full" />
          </div>

          {/* Tags */}
          <div className="px-5 py-2 flex justify-center gap-1.5">
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>

          {/* Footer */}
          <div className="border-t border-stone-100 dark:border-stone-800 px-5 py-3 flex items-center justify-between">
            <div className="skeleton h-4 w-20 rounded-full" />
            <div className="skeleton h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
