"use client";

import Image from "next/image";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { BentoGrid } from "@/components/bento/bento-grid";
import { TESTIMONIALS } from "@/data/mock";

type Tone = "dark" | "glass" | "primary" | "amber" | "emerald" | "violet" | "rose";

const TONE_CLASSES: Record<Tone, string> = {
  dark: "bg-zinc-950 text-white border-white/10",
  glass:
    "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-white/50 dark:border-white/10",
  primary:
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border-indigo-400/30",
  amber:
    "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300/40",
  emerald:
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/30",
  violet:
    "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-violet-400/30",
  rose:
    "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-400/30",
};

// Pick 5 testimonials, first one gets hero card treatment
const items = TESTIMONIALS.slice(0, 5);

type Card = {
  tone: Tone;
  span: string;
  variant: "hero" | "compact";
};

const LAYOUT: Card[] = [
  { tone: "dark", span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-7 row-span-2", variant: "hero" },
  { tone: "glass", span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-5", variant: "compact" },
  { tone: "amber", span: "col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-5", variant: "compact" },
  { tone: "violet", span: "col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-6", variant: "compact" },
  { tone: "emerald", span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-6", variant: "compact" },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-testi-card]", root);

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 48, scale: 0.96 });

      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: { amount: 0.45 },
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Voces reales
          </p>
          <h2
            ref={headingRef}
            className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Lo que cuentan quienes ya lo han vivido
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Miles de profesionales han encontrado en GuidePath la orientación
            que estaban buscando.
          </p>
        </div>

        <BentoGrid columns={12} gap="normal" className="mt-14">
          {items.map((t, i) => {
            const layout = LAYOUT[i] ?? LAYOUT[LAYOUT.length - 1];
            const isHero = layout.variant === "hero";
            const isDark =
              layout.tone === "dark" ||
              layout.tone === "primary" ||
              layout.tone === "amber" ||
              layout.tone === "violet" ||
              layout.tone === "emerald" ||
              layout.tone === "rose";

            return (
              <article
                key={t.id}
                data-testi-card
                className={`relative overflow-hidden rounded-3xl ${TONE_CLASSES[layout.tone]} ${
                  layout.span
                } ${isHero ? "p-8 sm:p-10" : "p-6 sm:p-7"} flex flex-col`}
              >
                {/* Aurora for dark hero */}
                {isHero && (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.5) 0%, transparent 70%), radial-gradient(50% 50% at 90% 80%, rgba(236,72,153,0.3) 0%, transparent 65%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                        backgroundSize: "38px 38px",
                      }}
                    />
                  </>
                )}

                <div className="relative z-[1] flex h-full flex-col">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      isDark ? "bg-white/15 ring-1 ring-white/20" : "bg-primary/10"
                    }`}
                  >
                    <Quote className={`h-5 w-5 ${isDark ? "text-white" : "text-primary"}`} />
                  </div>

                  <div className="mt-5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`h-4 w-4 ${
                          si < t.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : isDark
                            ? "text-white/20"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <blockquote
                    className={`mt-5 font-heading tracking-tight leading-snug ${
                      isHero
                        ? "text-2xl sm:text-3xl lg:text-4xl font-semibold"
                        : "text-base sm:text-lg font-medium"
                    } ${isDark ? "text-white" : ""}`}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div
                    className={`mt-auto pt-6 flex items-center gap-3 ${
                      isDark ? "border-t border-white/10" : "border-t border-border/60"
                    }`}
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/20">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-white" : ""}`}>
                        {t.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
