"use client";

import Link from "next/link";
import React, { useRef } from "react";
import {
  ArrowRight,
  ChevronDown,
  Star,
  Trophy,
  Video,
  Gift,
  Rocket,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { gsap, useGSAP } from "@/lib/gsap-config";

// ─── Word-safe character split ─────────────────────────────────────────────────

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
                  className={`inline-block${gradient ? " text-gradient-on-dark" : ""}`}
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

// ─── Main Bento Hero ───────────────────────────────────────────────────────────

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root);
      const badge = root.querySelector<HTMLElement>("[data-badge]");
      const subtitle = root.querySelector<HTMLElement>("[data-subtitle]");
      const cta = root.querySelector<HTMLElement>("[data-cta]");
      const bentoCards = gsap.utils.toArray<HTMLElement>("[data-hero-bento]", root);

      if (reduced) {
        gsap.set([...chars, badge, subtitle, cta, ...bentoCards].filter(Boolean), {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
        });
        return;
      }

      // Initial states
      gsap.set(chars, { yPercent: 110, rotation: 3, opacity: 0 });
      if (badge) gsap.set(badge, { opacity: 0, y: 18 });
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 22 });
      if (cta) gsap.set(cta, { opacity: 0, y: 22 });
      gsap.set(bentoCards, { opacity: 0, y: 36, scale: 0.95 });

      const tl = gsap.timeline({ delay: 0.15 });

      if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" });

      tl.to(
        chars,
        {
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: { amount: 0.45, from: "start" },
        },
        "-=0.15"
      )
        .to(subtitle ?? [], { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, "-=0.35")
        .to(cta ?? [], { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" }, "-=0.35")
        .to(
          bentoCards,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "expo.out",
            stagger: { amount: 0.35, from: "start" },
          },
          "-=0.45"
        );

      // Cursor spotlight on hero card
      const spotlight = spotlightRef.current;
      const heroCard = heroCardRef.current;
      if (spotlight && heroCard) {
        const onMove = contextSafe!((e: MouseEvent) => {
          const rect = heroCard.getBoundingClientRect();
          gsap.to(spotlight, {
            x: e.clientX - rect.left - 200,
            y: e.clientY - rect.top - 200,
            duration: 0.9,
            ease: "power2.out",
          });
        });
        heroCard.addEventListener("mousemove", onMove as EventListener);
        return () => heroCard.removeEventListener("mousemove", onMove as EventListener);
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden pt-8 pb-16 sm:pt-10 sm:pb-20"
    >
      {/* Page-wide aurora */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[720px] w-[1200px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-fuchsia-500/15 to-transparent blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow badge */}
        <div data-badge data-gsap-init className="mb-6 flex justify-center lg:justify-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Orientación profesional gratuita · Más de 150 mentores
          </span>
        </div>

        <BentoGrid columns={12} gap="normal">
          {/* ── HERO CARD: dark aurora with headline ──────────────────────── */}
          <BentoCard
            span="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 row-span-2"
            tone="dark"
            noBorder
            className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] !p-10 sm:!p-12 lg:!p-14"
          >
            {/* Aurora backdrop */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 60% at 18% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(55% 55% at 88% 70%, rgba(236,72,153,0.35) 0%, transparent 65%), radial-gradient(65% 60% at 55% 100%, rgba(56,189,248,0.3) 0%, transparent 70%)",
              }}
            />
            {/* Subtle grid */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            {/* Cursor spotlight */}
            <div
              ref={spotlightRef}
              aria-hidden
              className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-white/10 blur-[100px] will-change-transform"
              style={{ transform: "translate(-9999px, -9999px)" }}
            />

            <div ref={heroCardRef} className="relative z-[1] flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium ring-1 ring-white/20 backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  GuidePath · Freemium
                </span>

                <h1 className="mt-6 font-heading font-bold tracking-tight text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[1.02] text-white">
                  <CharSplit text="Encuentra" />
                  {" "}
                  <CharSplit text="tu camino" gradient />
                  <br />
                  <span className="text-[0.78em] text-white/75 font-semibold">
                    <CharSplit text="con quien te " />
                    <RotatingWords
                      words={["guíe", "inspire", "impulse", "acompañe"]}
                      className="text-gradient-on-dark font-bold"
                    />
                  </span>
                </h1>

                <p
                  data-subtitle
                  data-gsap-init
                  className="mt-6 max-w-xl text-lg text-white/80 leading-relaxed"
                >
                  Coaches, mentores y psicólogos laborales certificados. Sesiones por videollamada,{" "}
                  <span className="font-semibold text-white">completamente gratis</span>.
                </p>
              </div>

              <div data-cta data-gsap-init className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto h-12 px-7 text-base font-semibold !bg-white !text-zinc-900 hover:!bg-white/90 shadow-lg shadow-black/20"
                  asChild
                >
                  <Link href="/explore">
                    Explorar profesionales
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 text-base font-medium !border-white/30 !text-white !bg-white/5 hover:!bg-white/10 hover:!border-white/50 backdrop-blur"
                  asChild
                >
                  <Link href="#como-funciona">Cómo funciona</Link>
                </Button>

                <div className="flex items-center gap-2 sm:ml-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">4,9</span>
                  <span className="text-xs text-white/60">
                    ·{" "}
                    <AnimatedCounter target={2500} suffix="+" decimals={0} />{" "}
                    sesiones
                  </span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* ── STAT 1: mentores verificados ──────────────────────────────── */}
          <div data-hero-bento className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <BentoCard
              span=""
              tone="glass"
              interactive
              icon={<Trophy className="h-5 w-5 text-indigo-500" />}
              eyebrow="Comunidad"
              className="h-full"
            >
              <div className="mt-auto">
                <p className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                  <AnimatedCounter target={150} suffix="+" decimals={0} />
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  mentores, coaches y psicólogos verificados
                </p>
              </div>
            </BentoCard>
          </div>

          {/* ── STAT 2: gratis ────────────────────────────────────────────── */}
          <div data-hero-bento className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <BentoCard
              span=""
              tone="primary"
              interactive
              noBorder
              icon={<Gift className="h-5 w-5" />}
              eyebrow="Freemium"
              className="h-full"
            >
              <div className="mt-auto">
                <p className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                  3
                  <span className="ml-2 text-lg opacity-80">sesiones</span>
                </p>
                <p className="mt-1 text-sm font-medium text-white/90">
                  gratis al mes · sin tarjeta ni compromiso
                </p>
              </div>
            </BentoCard>
          </div>

          {/* ── FEATURE ROW: 3 mini cards ─────────────────────────────────── */}
          <div data-hero-bento className="col-span-2 sm:col-span-4 md:col-span-4 lg:col-span-4">
            <BentoCard
              span=""
              tone="emerald"
              noBorder
              icon={<Video className="h-5 w-5" />}
              eyebrow="Videollamada"
              title="HD con screen share"
              description="Sala integrada en la web. Sin descargas, con chat y grabación."
              className="h-full"
            />
          </div>

          <div data-hero-bento className="col-span-2 sm:col-span-4 md:col-span-4 lg:col-span-4">
            <BentoCard
              span=""
              tone="amber"
              noBorder
              icon={<Rocket className="h-5 w-5" />}
              eyebrow="En 3 clics"
              title="Reserva sin fricción"
              description="Elige pro, franja y listo. Primera sesión en menos de 24 h."
              className="h-full"
            />
          </div>

          <div data-hero-bento className="col-span-2 sm:col-span-4 md:col-span-4 lg:col-span-4">
            <BentoCard
              span=""
              tone="violet"
              noBorder
              icon={<ShieldCheck className="h-5 w-5" />}
              eyebrow="Verificación"
              title="Certificados reales"
              description="Todos los profesionales validados manualmente antes de aparecer."
              className="h-full"
            />
          </div>
        </BentoGrid>

        {/* Scroll hint */}
        <div className="mt-12 flex flex-col items-center gap-1 text-foreground/40 animate-bounce-slow">
          <span className="text-[11px] uppercase tracking-widest font-medium">
            Descubre más
          </span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
