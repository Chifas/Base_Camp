"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

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
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chips = gsap.utils.toArray<HTMLElement>("[data-company-chip]", root);

      if (reduced) {
        gsap.set(chips, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(chips, { opacity: 0, y: 16 });

      ScrollTrigger.batch(chips, {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "expo.out",
            stagger: { amount: 0.35 },
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border bg-card/60 backdrop-blur-sm px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              Profesionales de
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {COMPANIES.map((name) => (
                <span
                  key={name}
                  data-company-chip
                  className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground sm:text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
