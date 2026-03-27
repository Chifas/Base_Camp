"use client";

const COMPANIES = [
  "Cabify",
  "Glovo",
  "Factorial",
  "Typeform",
  "Holaluz",
  "Flywire",
  "Cabify",
  "Glovo",
  "Factorial",
  "Typeform",
  "Holaluz",
  "Flywire",
];

export function TrustBar() {
  return (
    <div className="border-y border-border/40 bg-muted/20 py-8">
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
            className="flex gap-12 whitespace-nowrap"
            style={{
              animation: "marquee-trust 60s linear infinite",
            }}
          >
            {COMPANIES.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="text-lg font-bold text-muted-foreground/40 tracking-tight select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-trust {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
