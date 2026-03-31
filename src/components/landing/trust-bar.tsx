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
      <div className="border-y border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Profesionales de empresas como
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {COMPANIES.map((name) => (
              <span
                key={name}
                className="text-base font-semibold text-muted-foreground/40 select-none sm:text-lg"
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
