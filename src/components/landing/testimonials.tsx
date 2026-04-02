"use client";

import Image from "next/image";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { TESTIMONIALS } from "@/data/mock";

// Enough copies for seamless dual-row infinite loop
const row1 = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];
const row2 = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].reverse();

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
}) {
  return (
    <div className="glass relative w-[320px] shrink-0 rounded-2xl p-6 mx-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Quote className="h-4 w-4 text-primary" />
      </div>

      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="mt-5 mb-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
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

function MarqueeRow({
  items,
  direction,
  trackRef,
}: {
  items: typeof TESTIMONIALS;
  direction: "left" | "right";
  trackRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="relative overflow-hidden py-2">
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function Testimonials() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const t1 = track1Ref.current;
      const t2 = track2Ref.current;
      if (!t1 || !t2) return;

      const halfW1 = t1.scrollWidth / 2;
      const halfW2 = t2.scrollWidth / 2;

      const speed = 80; // px/s

      const tween1 = gsap.to(t1, {
        x: `-=${halfW1}`,
        duration: halfW1 / speed,
        ease: "none",
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % halfW1) },
      });

      const tween2 = gsap.fromTo(
        t2,
        { x: `-${halfW2 * 0.5}` },
        {
          x: 0,
          duration: halfW2 / speed,
          ease: "none",
          repeat: -1,
          modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % halfW2) },
        }
      );

      const pause1 = contextSafe!(() => tween1.pause());
      const play1 = contextSafe!(() => tween1.play());
      const pause2 = contextSafe!(() => tween2.pause());
      const play2 = contextSafe!(() => tween2.play());

      t1.addEventListener("mouseenter", pause1 as EventListener);
      t1.addEventListener("mouseleave", play1 as EventListener);
      t2.addEventListener("mouseenter", pause2 as EventListener);
      t2.addEventListener("mouseleave", play2 as EventListener);

      return () => {
        tween1.kill();
        tween2.kill();
        t1.removeEventListener("mouseenter", pause1 as EventListener);
        t1.removeEventListener("mouseleave", play1 as EventListener);
        t2.removeEventListener("mouseenter", pause2 as EventListener);
        t2.removeEventListener("mouseleave", play2 as EventListener);
      };
    },
    { scope: wrapperRef }
  );

  return (
    <section className="border-t bg-muted/30 py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Testimonios
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Miles de personas ya han encontrado la orientación que necesitaban.
          </p>
        </FadeIn>
      </div>

      {/* Dual-row marquee */}
      <div ref={wrapperRef} className="relative mt-14 space-y-4">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-r from-muted/80 to-transparent dark:from-background" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-l from-muted/80 to-transparent dark:from-background" />

        {/* Row 1 — left */}
        <MarqueeRow items={row1} direction="left" trackRef={track1Ref} />

        {/* Row 2 — right (offset) */}
        <MarqueeRow items={row2} direction="right" trackRef={track2Ref} />
      </div>
    </section>
  );
}
