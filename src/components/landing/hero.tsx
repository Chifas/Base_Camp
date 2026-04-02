"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Play, Shield, Star, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBg } from "@/components/shared/animated-gradient-bg";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";
import { gsap, useGSAP } from "@/lib/gsap-config";

// ─── Character-split component ────────────────────────────────────────────────
// Each character gets its own overflow:hidden wrapper so the slide-up stays clipped.

function CharSplit({
  text,
  className,
  gradient = false,
}: {
  text: string;
  className?: string;
  gradient?: boolean;
}) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden leading-[1.1] align-bottom"
          style={{ verticalAlign: "bottom" }}
        >
          <span
            data-char
            className={`inline-block${gradient ? " text-gradient" : ""}`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const btn1Ref = useRef<HTMLDivElement>(null);
  const btn2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", sectionRef.current!);
      const badge = sectionRef.current?.querySelector<HTMLElement>("[data-badge]");
      const subtitle = sectionRef.current?.querySelector<HTMLElement>("[data-subtitle]");
      const cta = sectionRef.current?.querySelector<HTMLElement>("[data-cta]");
      const stats = gsap.utils.toArray<HTMLElement>("[data-stat]", sectionRef.current!);

      // Initial states
      gsap.set(chars, { y: "110%", rotation: 6, opacity: 0 });
      if (badge) gsap.set(badge, { opacity: 0, y: 28 });
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 28 });
      if (cta) gsap.set(cta, { opacity: 0, y: 28 });
      gsap.set(stats, { opacity: 0, y: 40, scale: 0.92 });

      // Master entrance timeline
      const tl = gsap.timeline({ delay: 0.15 });

      if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
      tl.to(
          chars,
          {
            y: "0%",
            rotation: 0,
            opacity: 1,
            duration: 0.75,
            ease: "expo.out",
            stagger: { amount: 0.55, from: "start" },
          },
          "-=0.25"
        )
        .to(subtitle ?? [], { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, "-=0.35")
        .to(cta ?? [], { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "-=0.4")
        .to(
          stats,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: "back.out(1.7)",
            stagger: 0.1,
          },
          "-=0.35"
        );

      // ── Magnetic buttons ──────────────────────────────────────────────────
      const makeMagnetic = contextSafe!((el: HTMLElement, strength: number) => {
        const onMove = contextSafe!((e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
          const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
          gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
        });
        const onLeave = contextSafe!(() => {
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        });
        el.addEventListener("mousemove", onMove as EventListener);
        el.addEventListener("mouseleave", onLeave as EventListener);
      });

      if (btn1Ref.current) makeMagnetic(btn1Ref.current, 0.35);
      if (btn2Ref.current) makeMagnetic(btn2Ref.current, 0.25);

      // ── Cursor spotlight ─────────────────────────────────────────────────
      const spotlight = spotlightRef.current;
      if (spotlight) {
        const onMouseMove = contextSafe!((e: MouseEvent) => {
          const rect = sectionRef.current!.getBoundingClientRect();
          gsap.to(spotlight, {
            x: e.clientX - rect.left - 200,
            y: e.clientY - rect.top - 200,
            duration: 0.9,
            ease: "power2.out",
          });
        });
        sectionRef.current!.addEventListener("mousemove", onMouseMove as EventListener);
        return () => {
          sectionRef.current?.removeEventListener("mousemove", onMouseMove as EventListener);
        };
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center"
    >
      <AnimatedGradientBg />

      {/* Cursor spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-primary/8 blur-[90px] -z-10 will-change-transform"
        style={{ transform: "translate(-9999px, -9999px)" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 w-full">
        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}
          <div data-badge style={{ opacity: 0 }}>
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm backdrop-blur-sm hover:border-primary/40 transition-colors cursor-default group">
              <Sparkles className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-muted-foreground">Plataforma líder en orientación profesional</span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>

          {/* Headline — character split */}
          <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <CharSplit text="Encuentra " />
            <CharSplit text="tu camino" gradient />
            <br />
            <span className="text-[0.85em]">
              <CharSplit text="con quien te " />
              <RotatingWords
                words={["guíe", "inspire", "impulse", "acompañe"]}
                className="text-gradient"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            data-subtitle
            style={{ opacity: 0 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            Conectamos profesionales con coaches y mentores especializados en
            desarrollo de carrera, liderazgo y emprendimiento.{" "}
            <span className="text-foreground font-medium">
              Sesiones por videollamada, cuando tú quieras.
            </span>
          </p>

          {/* CTA — magnetic wrappers */}
          <div
            data-cta
            style={{ opacity: 0 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <div ref={btn1Ref} className="inline-flex">
              <Button
                size="lg"
                className="group btn-glow !bg-zinc-900 !text-white hover:!bg-zinc-800 dark:!bg-white dark:!text-zinc-900 dark:hover:!bg-zinc-100 h-12 px-8 text-base"
                asChild
              >
                <Link href="/explore">
                  Explorar profesionales
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div ref={btn2Ref} className="inline-flex">
              <Button
                variant="outline"
                size="lg"
                className="!border-zinc-900/30 !bg-transparent !text-zinc-900 hover:!bg-zinc-900/10 dark:!border-white/30 dark:!text-white dark:hover:!bg-white/10 h-12 px-8 text-base"
                asChild
              >
                <Link href="#como-funciona">
                  <Play className="mr-2 h-4 w-4" />
                  Cómo funciona
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Users, target: 2500, suffix: "+", label: "Profesionales acelerados", decimals: 0 },
              { icon: Shield, target: 150, suffix: "+", label: "Mentores y coaches", decimals: 0 },
              { icon: Star, target: 4.8, suffix: "", label: "Valoración media", decimals: 1 },
            ].map((stat) => (
              <div
                key={stat.label}
                data-stat
                style={{ opacity: 0 }}
                className="group relative rounded-2xl border bg-background/70 backdrop-blur-md p-4 sm:p-6 transition-all duration-300 hover:bg-background/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 card-glow"
              >
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="font-heading text-2xl font-bold sm:text-3xl lg:text-4xl">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
