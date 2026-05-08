"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { TESTIMONIALS } from "@/data/mock";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-amber-600",
  "bg-teal-700",
  "bg-stone-600",
  "bg-teal-500",
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-testimonial-card]",
        sectionRef.current!
      );

      gsap.set(cards, { y: 30 });

      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {

            y: 0,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.1,
          });
        },
      });
    },
    { scope: sectionRef }
  );

  const displayed = TESTIMONIALS.slice(0, 3);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 dark:from-stone-950 dark:via-stone-950 dark:to-black py-20 sm:py-28"
    >
      {/* Aurora glows to break the flat dark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-[30rem] w-[30rem] rounded-full bg-teal-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-500/8 blur-3xl"
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#5eead420_1px,transparent_1px)] [background-size:32px_32px] opacity-40"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-sm font-display font-semibold uppercase tracking-widest text-teal-400 mb-2">
            Testimonios
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-50">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-stone-300">
            Cientos de profesionales ya han encontrado la orientación que necesitaban.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((testimonial, i) => (
            <div
              key={testimonial.id}
              data-testimonial-card
              className="relative rounded-2xl border border-stone-700/60 bg-stone-800/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-teal-700/60 hover:bg-stone-800/70 hover:shadow-xl hover:shadow-teal-500/5"
            >
              {/* Decorative quote mark */}
              <span className="absolute right-6 top-4 font-display text-7xl font-bold leading-none text-teal-400/20 select-none">
                &ldquo;
              </span>

              <blockquote className="relative font-display text-base font-medium leading-relaxed text-stone-100">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-xs font-bold text-white`}
                >
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-50">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-stone-300">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
