"use client";

import { FadeIn } from "@/components/shared/motion-wrapper";

const COMPANIES = [
  "Cabify",
  "Glovo",
  "Factorial",
  "Typeform",
  "Holaluz",
  "Flywire",
  "Banco Santander",
];

export function TrustBar() {
  return (
    <FadeIn>
      <div className="bg-stone-100 dark:bg-stone-900/60 border-y border-stone-200 dark:border-stone-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Profesionales verificados de:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {COMPANIES.map((name) => (
              <span
                key={name}
                className="text-base font-semibold text-stone-400 dark:text-stone-500 select-none sm:text-lg"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
