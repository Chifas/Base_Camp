"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";
import { TESTIMONIALS } from "@/data/mock";

export function Testimonials() {
  return (
    <section className="border-t bg-muted/30 py-20 sm:py-28">
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

        <StaggerContainer
          className="mt-16 grid gap-8 md:grid-cols-3"
          delay={0.2}
        >
          {TESTIMONIALS.map((testimonial) => (
            <StaggerItem key={testimonial.id}>
              <motion.div
                className="glass relative rounded-2xl p-8 card-glow"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {/* Gradient quote mark */}
                <span className="absolute right-6 top-4 select-none font-serif text-6xl text-gradient opacity-20">
                  &ldquo;
                </span>

                {/* Stars with stagger */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                    >
                      <Star
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.3)]"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="mt-4 text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Gradient separator */}
                <div className="mt-6 mb-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                {/* Author */}
                <div className="flex items-center gap-3">
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
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
