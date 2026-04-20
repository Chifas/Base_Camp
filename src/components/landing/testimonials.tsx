"use client";

import Image from "next/image";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { TESTIMONIALS } from "@/data/mock";

function TestimonialCard({
  testimonial,
  featured = false,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
  featured?: boolean;
}) {
  return (
    <div
      data-testimonial-card
      className={`group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        featured ? "sm:p-8" : ""
      }`}
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "fill-amber-400 text-amber-400"
                : "text-stone-200 dark:text-stone-700"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className={`font-display font-medium leading-relaxed text-stone-700 dark:text-stone-300 ${featured ? "text-lg italic" : "text-sm"}`}>
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-stone-100 dark:ring-stone-800">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{testimonial.name}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = gsap.utils.toArray<HTMLElement>("[data-testimonial-card]", sectionRef.current!);

    gsap.set(cards, { opacity: 0, y: 30 });

    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: (i % 3) * 0.1,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      });
    });
  }, { scope: sectionRef });

  // Use first 5 testimonials for editorial layout
  const featured = TESTIMONIALS[0];
  const rest = TESTIMONIALS.slice(1, 5);

  return (
    <section className="bg-warm-surface/50 dark:bg-stone-900/20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <Quote className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-sm font-display font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
            Testimonios
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
            Miles de profesionales ya han encontrado la orientación que necesitaban.
          </p>
        </div>

        {/* Editorial grid */}
        <div ref={sectionRef}>
          {/* Featured quote — full width on mobile, 2-col span on desktop */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Featured (spans 2 cols on lg) */}
            <div className="sm:col-span-2 lg:col-span-2">
              <TestimonialCard testimonial={featured} featured />
            </div>

            {/* First of the rest */}
            {rest[0] && (
              <div>
                <TestimonialCard testimonial={rest[0]} />
              </div>
            )}

            {/* Remaining 3 */}
            {rest.slice(1).map((t) => (
              <div key={t.id}>
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
