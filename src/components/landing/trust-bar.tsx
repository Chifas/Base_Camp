"use client";

import { FadeIn } from "@/components/shared/motion-wrapper";

const COMPANIES = [
  { name: "Cabify", className: "text-lg font-extrabold tracking-tighter" },
  { name: "Glovo", className: "text-xl font-black tracking-wide uppercase" },
  { name: "Factorial", className: "text-lg font-semibold tracking-widest" },
  { name: "Typeform", className: "text-xl font-light lowercase tracking-tight" },
  { name: "Holaluz", className: "text-lg font-bold italic" },
  { name: "Flywire", className: "text-xl font-medium tracking-[0.2em] uppercase" },
];

// Duplicate for seamless loop
const LOGOS = [...COMPANIES, ...COMPANIES];

export function TrustBar() {
  return (
    <FadeIn>
      <div className="border-y border-border/40 bg-muted/20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            Profesionales de empresas como
          </p>

          {/* Marquee wrapper */}
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

            <div
              className="flex items-center gap-10 whitespace-nowrap"
              style={{ animation: "marquee-trust 60s linear infinite" }}
            >
              {LOGOS.map((company, i) => (
                <span key={`${company.name}-${i}`} className="flex items-center gap-10">
                  <span
                    className={`text-muted-foreground/40 select-none ${company.className}`}
                  >
                    {company.name}
                  </span>
                  <span className="text-muted-foreground/20 select-none text-sm">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
