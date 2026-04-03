"use client";

import Link from "next/link";
import { useRef } from "react";
import React from "react";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBg } from "@/components/shared/animated-gradient-bg";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";
import { gsap, useGSAP } from "@/lib/gsap-config";

// ─── Word-safe character split ─────────────────────────────────────────────────
// Each word is wrapped in whitespace-nowrap so the browser can only break
// between words (never mid-word). Spaces are separate data-char spans so
// they still participate in the GSAP entrance stagger.

function CharSplit({
  text,
  className,
  gradient = false,
}: {
  text: string;
  className?: string;
  gradient?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char, ci) => (
              <span
                key={ci}
                className="inline-block overflow-hidden leading-[1.1] align-bottom"
                style={{ verticalAlign: "bottom" }}
              >
                <span
                  data-char
                  className={`inline-block${gradient ? " text-gradient" : ""}`}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
          {wi < words.length - 1 && (
            <span
              className="inline-block overflow-hidden leading-[1.1] align-bottom"
              style={{ verticalAlign: "bottom" }}
            >
              <span data-char className="inline-block">
                &nbsp;
              </span>
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

// ─── Mentor avatar stack (social proof) ───────────────────────────────────────

const AVATARS = [
  { initials: "CR", from: "from-indigo-500", to: "to-violet-600" },
  { initials: "AM", from: "from-violet-500", to: "to-purple-600" },
  { initials: "LP", from: "from-blue-500", to: "to-cyan-500" },
  { initials: "MG", from: "from-emerald-500", to: "to-teal-500" },
  { initials: "SR", from: "from-rose-500", to: "to-pink-500" },
];

// ─── Main Hero ─────────────────────────────────────────────────────────────────

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
      const social = sectionRef.current?.querySelector<HTMLElement>("[data-social]");

      // Initial states
      gsap.set(chars, { y: "110%", rotation: 4, opacity: 0 });
      if (badge) gsap.set(badge, { opacity: 0, y: 24 });
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 28 });
      if (cta) gsap.set(cta, { opacity: 0, y: 28 });
      if (social) gsap.set(social, { opacity: 0, y: 20 });

      // Master entrance timeline
      const tl = gsap.timeline({ delay: 0.2 });

      if (badge) {
        tl.to(badge, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
      }

      tl.to(
          chars,
          {
            y: "0%",
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            ease: "expo.out",
            stagger: { amount: 0.5, from: "start" },
          },
          "-=0.2"
        )
        .to(subtitle ?? [], { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, "-=0.4")
        .to(cta ?? [], { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }, "-=0.4")
        .to(social ?? [], { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "-=0.35");

      // Magnetic buttons
      const makeMagnetic = contextSafe!((el: HTMLElement, strength: number) => {
        const onMove = contextSafe!((e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - (r.left + r.width / 2)) * strength,
            y: (e.clientY - (r.top + r.height / 2)) * strength,
            duration: 0.4,
            ease: "power2.out",
          });
        });
        const onLeave = contextSafe!(() => {
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        });
        el.addEventListener("mousemove", onMove as EventListener);
        el.addEventListener("mouseleave", onLeave as EventListener);
      });

      if (btn1Ref.current) makeMagnetic(btn1Ref.current, 0.3);
      if (btn2Ref.current) makeMagnetic(btn2Ref.current, 0.25);

      // Cursor spotlight
      const spotlight = spotlightRef.current;
      if (spotlight) {
        const onMove = contextSafe!((e: MouseEvent) => {
          const rect = sectionRef.current!.getBoundingClientRect();
          gsap.to(spotlight, {
            x: e.clientX - rect.left - 250,
            y: e.clientY - rect.top - 250,
            duration: 1.1,
            ease: "power2.out",
          });
        });
        sectionRef.current!.addEventListener("mousemove", onMove as EventListener);
        return () => sectionRef.current?.removeEventListener("mousemove", onMove as EventListener);
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-start overflow-hidden"
    >
      <AnimatedGradientBg />

      {/* Cursor spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-primary/6 blur-[120px] -z-10 will-change-transform"
        style={{ transform: "translate(-9999px, -9999px)" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-14 pb-6 sm:px-6 sm:pt-16 lg:px-8 text-center">

        {/* Badge */}
        <div data-badge style={{ opacity: 0 }}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/30">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Orientación profesional gratuita · Más de 150 mentores
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-bold tracking-tight text-[clamp(2.8rem,8vw,6.5rem)] leading-[1.05]">
          <CharSplit text="Encuentra" />
          {" "}
          <CharSplit text="tu camino" gradient />
          <br />
          <span className="text-[0.82em] text-muted-foreground/90 font-semibold">
            <CharSplit text="con quien te " />
            <RotatingWords
              words={["guíe", "inspire", "impulse", "acompañe"]}
              className="text-gradient font-bold"
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p
          data-subtitle
          style={{ opacity: 0 }}
          className="mx-auto mt-5 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          Coaches, mentores y psicólogos laborales certificados.
          <br className="hidden sm:block" />
          <span className="text-foreground/80 font-medium">
            {" "}Sesiones por videollamada, completamente gratis.
          </span>
        </p>

        {/* CTAs */}
        <div
          data-cta
          style={{ opacity: 0 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div ref={btn1Ref} className="inline-flex w-full sm:w-auto">
            <Button
              size="lg"
              className="group w-full sm:w-auto h-13 px-8 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-lg shadow-foreground/10"
              asChild
            >
              <Link href="/explore">
                Explorar profesionales
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <div ref={btn2Ref} className="inline-flex w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-13 px-8 text-base font-medium border-border/60 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-200"
              asChild
            >
              <Link href="#como-funciona">
                Cómo funciona
              </Link>
            </Button>
          </div>
        </div>

        {/* Social proof */}
        <div
          data-social
          style={{ opacity: 0 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2.5">
            {AVATARS.map(({ initials, from, to }) => (
              <div
                key={initials}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${from} ${to} text-[11px] font-bold text-white ring-2 ring-background shadow-sm`}
              >
                {initials}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-semibold">4.9</span>
            <span className="text-sm text-muted-foreground">
              ·{" "}
              <span className="font-medium text-foreground/80">
                <AnimatedCounter target={2500} suffix="+" decimals={0} />
              </span>{" "}
              sesiones completadas
            </span>
          </div>
        </div>

      </div>

      {/* Scroll indicator — flex item pushed to bottom, always visible */}
      <div className="relative z-10 mt-auto mb-6 flex flex-col items-center gap-1 text-foreground/40 animate-bounce-slow">
        <span className="text-[11px] uppercase tracking-widest font-medium">Descubre más</span>
        <ChevronDown className="h-4 w-4" />
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
