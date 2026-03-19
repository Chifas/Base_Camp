"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { TESTIMONIALS } from "@/data/mock";

// Duplicate for seamless infinite scroll
const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
}) {
  return (
    <div className="glass relative w-[340px] shrink-0 rounded-2xl p-6 mx-3 card-glow transition-all duration-300 hover:-translate-y-1">
      {/* Quote icon */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
        <Quote className="h-4 w-4 text-primary" />
      </div>

      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.3)]"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Gradient separator */}
      <div className="mt-5 mb-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/10">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="border-t bg-muted/30 py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonios
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Miles de personas ya han encontrado la orientación que necesitaban.
          </p>
        </FadeIn>
      </div>

      {/* Marquee — infinite scroll */}
      <div className="relative mt-14">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-r from-muted/80 to-transparent dark:from-background" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-l from-muted/80 to-transparent dark:from-background" />

        <motion.div
          className="flex py-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {marqueeItems.map((testimonial, i) => (
            <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
