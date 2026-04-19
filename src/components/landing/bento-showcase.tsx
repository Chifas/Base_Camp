"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Video,
  Clock4,
  Trophy,
  ArrowUpRight,
  Gift,
  BarChart3,
  Rocket,
} from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";
import { AnimatedCounter } from "@/components/shared/animated-counter";

export function BentoShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", root);

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 60, scale: 0.94 });

      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "expo.out",
            stagger: { amount: 0.55, from: "start" },
            overwrite: "auto",
          });
        },
      });

      // Heading char reveal
      if (headingRef.current) {
        const chars = headingRef.current.querySelectorAll<HTMLElement>("[data-h-char]");
        gsap.set(chars, { yPercent: 110, opacity: 0 });
        gsap.to(chars, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: { amount: 0.4 },
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        });
      }

      // Parallax aurora blob
      if (auroraRef.current) {
        gsap.to(auroraRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    },
    { scope: sectionRef }
  );

  const heading = "Una plataforma, un ecosistema completo";

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* Parallax aurora */}
      <div
        ref={auroraRef}
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            El ecosistema GuidePath
          </p>
          <h2
            ref={headingRef}
            className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            {heading.split(" ").map((word, wi, arr) => (
              <span key={wi} className="inline-block whitespace-nowrap">
                {word.split("").map((c, ci) => (
                  <span
                    key={ci}
                    className="inline-block overflow-hidden leading-[1.1] align-bottom"
                    style={{ verticalAlign: "bottom" }}
                  >
                    <span data-h-char className="inline-block">
                      {c}
                    </span>
                  </span>
                ))}
                {wi < arr.length - 1 && (
                  <span className="inline-block overflow-hidden leading-[1.1] align-bottom">
                    <span data-h-char className="inline-block">
                      &nbsp;
                    </span>
                  </span>
                )}
              </span>
            ))}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Videollamada, chat, historial, rewards y seguimiento en un mismo lugar.
            Diseñado para que la conversación fluya y el impacto se mida.
          </p>
        </div>

        <BentoGrid columns={12} gap="normal" className="mt-16">
          {/* HERO: aurora feature card */}
          <BentoCard
            span="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-7 row-span-2"
            tone="dark"
            interactive
            noBorder
            icon={<Sparkles className="h-5 w-5" />}
            eyebrow="Destacado"
            title="Sesiones por videollamada que dejan huella"
            description="Entra a tu sesión desde la web — sin descargas, sin fricción. Compartir pantalla, chat en vivo y grabación quedan integrados en la misma sala."
            className="relative"
          >
            {/* Aurora backdrop */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(50% 50% at 90% 70%, rgba(236,72,153,0.35) 0%, transparent 60%), radial-gradient(60% 60% at 60% 100%, rgba(56,189,248,0.35) 0%, transparent 70%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-[1] mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
                <Video className="h-3.5 w-3.5" /> Videollamada HD
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" /> Encriptación E2E
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
                <Clock4 className="h-3.5 w-3.5" /> 60 min / sesión
              </span>
            </div>
          </BentoCard>

          {/* STAT 1: mentores */}
          <BentoCard
            span="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5"
            tone="glass"
            interactive
            icon={<Trophy className="h-5 w-5 text-indigo-500" />}
            eyebrow="Comunidad"
            className="text-center sm:text-left"
          >
            <div className="flex flex-1 flex-col justify-center">
              <p className="font-heading text-5xl font-bold tracking-tight sm:text-6xl">
                <AnimatedCounter target={150} suffix="+" decimals={0} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                mentores, coaches y psicólogos verificados
              </p>
            </div>
          </BentoCard>

          {/* STAT 2: rating */}
          <BentoCard
            span="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5"
            tone="emerald"
            interactive
            noBorder
            icon={<BarChart3 className="h-5 w-5" />}
            eyebrow="Satisfacción"
          >
            <div className="flex flex-1 flex-col justify-center">
              <p className="font-heading text-5xl font-bold tracking-tight sm:text-6xl">
                4,9
                <span className="ml-1 text-2xl opacity-80">/5</span>
              </p>
              <p className="mt-2 text-sm font-medium opacity-90">
                valoración media de{" "}
                <AnimatedCounter target={2500} suffix="+" decimals={0} /> sesiones
              </p>
            </div>
          </BentoCard>

          {/* REWARDS */}
          <BentoCard
            span="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4"
            tone="amber"
            interactive
            noBorder
            icon={<Gift className="h-5 w-5" />}
            eyebrow="Impact Points"
            title="Cada sesión suma"
            description="Los profesionales canjean puntos por certificaciones o donaciones solidarias."
            footer={
              <span className="inline-flex items-center gap-1 text-white/95 font-medium">
                Ver programa <ArrowUpRight className="h-4 w-4" />
              </span>
            }
          />

          {/* PROCESS */}
          <BentoCard
            span="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4"
            tone="plain"
            interactive
            icon={<Rocket className="h-5 w-5 text-indigo-500" />}
            eyebrow="En 3 clics"
            title="Reserva sin fricción"
            description="Elige profesional, franja horaria y listo. Tu primera sesión es en menos de 24 horas."
          >
            <div className="mt-4 flex items-center gap-2">
              {["Explora", "Reserva", "Conecta"].map((label, i) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-muted/50 p-2.5 text-center text-[11px] font-medium"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {i + 1}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* CTA */}
          <BentoCard
            span="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4"
            tone="primary"
            interactive
            noBorder
            icon={<HeartHandshake className="h-5 w-5" />}
            eyebrow="Freemium"
            title="3 sesiones gratis al mes"
            description="Sin tarjeta, sin compromiso. Renuévalas el 1 de cada mes."
            footer={
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1 font-semibold text-white hover:gap-2 transition-all"
              >
                Empezar ahora <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
        </BentoGrid>
      </div>
    </section>
  );
}
