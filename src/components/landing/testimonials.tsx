"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";
import { TESTIMONIALS } from "@/data/mock";

// Show only 3 testimonials in a clean grid
const displayTestimonials = TESTIMONIALS.slice(0, 3);

export function Testimonials() {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Miles de profesionales ya han encontrado la orientación que
            necesitaban.
          </p>
        </FadeIn>

        <StaggerContainer
          className="mt-12 grid gap-6 md:grid-cols-3"
          delay={0.1}
        >
          {displayTestimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <div className="flex h-full flex-col rounded-2xl border bg-card p-6">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/20" />

                {/* Stars */}
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Quote text */}
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3 border-t pt-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
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
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
