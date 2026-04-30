"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap-config";

const AVATARS = [
  { initials: "CR", bg: "bg-teal-600" },
  { initials: "AM", bg: "bg-teal-500" },
  { initials: "LP", bg: "bg-amber-600" },
  { initials: "MG", bg: "bg-teal-700" },
  { initials: "SR", bg: "bg-amber-500" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const s = sectionRef.current!;

      const badge   = s.querySelector<HTMLElement>("[data-badge]");
      const heading = s.querySelector<HTMLElement>("[data-heading]");
      const sub     = s.querySelector<HTMLElement>("[data-sub]");
      const btns    = s.querySelector<HTMLElement>("[data-btns]");
      const social  = s.querySelector<HTMLElement>("[data-social]");
      const trust   = s.querySelector<HTMLElement>("[data-trust]");
      const cards   = cardsRef.current;

      // CSS (@keyframes hero-fade-in in globals.css) handles opacity so the
      // hero is always visible even if GSAP fails.  GSAP drives only the
      // Y / X slide-in transforms — a polish layer on top.
      gsap.set(badge,   { y: -10 });
      gsap.set(heading, { y: 40 });
      gsap.set(sub,     { y: 20 });
      gsap.set(btns,    { y: 20 });
      gsap.set(social,  { y: 16 });
      gsap.set(trust,   { y: 12 });
      if (cards) gsap.set(cards, { x: 40 });

      const tl = gsap.timeline();
      tl.to(badge,       { y: 0, duration: 0.5,  ease: "power3.out" })
        .to(heading,     { y: 0, duration: 0.8,  ease: "power3.out" }, "-=0.25")
        .to(sub,         { y: 0, duration: 0.6,  ease: "power3.out" }, "-=0.5")
        .to(btns,        { y: 0, duration: 0.6,  ease: "power3.out" }, "-=0.45")
        .to(social,      { y: 0, duration: 0.55, ease: "power3.out" }, "-=0.4")
        .to(trust,       { y: 0, duration: 0.5,  ease: "power3.out" }, "-=0.35")
        .to(cards ?? [], { x: 0, duration: 0.9,  ease: "power3.out" }, "-=0.65");
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="hero-section relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-teal-50/40 dark:from-stone-950 dark:via-stone-900 dark:to-teal-950/30"
    >
      {/* Aurora blobs — main visual accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 h-[32rem] w-[32rem] rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-1/3 h-[24rem] w-[24rem] rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-400/10"
      />

      {/* Subtle dot grid — sits above aurora, below content */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#0d737718_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 md:grid-cols-5 md:gap-8 lg:px-8 lg:py-32">

        {/* ── Left column ── */}
        <div className="md:col-span-3">
          {/* Badge */}
          <div data-badge>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              ✦ Expertos verificados en España
            </span>
          </div>

          {/* Heading */}
          <h1
            data-heading
            className="font-display font-extrabold tracking-tight text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] text-stone-900 dark:text-stone-50"
          >
            Encuentra el mentor<br />
            que cambiará{" "}
            <span className="text-gradient-teal">tu carrera</span>
          </h1>

          {/* Subheading */}
          <p
            data-sub
            className="mt-6 max-w-lg text-lg text-stone-600 dark:text-stone-400 leading-relaxed sm:text-xl"
          >
            Coaches ejecutivos, mentores de carrera y psicólogos laborales certificados.
            Sesiones por videollamada,{" "}
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              completamente gratis.
            </span>
          </p>

          {/* Buttons */}
          <div data-btns className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group h-12 px-7 text-base font-display font-semibold bg-teal-700 text-white hover:bg-teal-800 shadow-md shadow-teal-700/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              asChild
            >
              <Link href="/explore">
                Explorar expertos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 text-base font-display font-medium border-stone-300 bg-white/70 text-stone-700 hover:bg-white dark:border-stone-700 dark:bg-transparent dark:text-stone-300"
              asChild
            >
              <Link href="/auth/register?role=PROFESSIONAL">¿Eres profesional?</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div data-social className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {AVATARS.map(({ initials, bg }) => (
                <div
                  key={initials}
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${bg} text-[11px] font-bold text-white ring-2 ring-white dark:ring-stone-900`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-sm font-semibold text-stone-800 dark:text-stone-200">4.9</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Más de 230 expertos verificados
              </p>
            </div>
          </div>

          {/* Microtrust */}
          <div data-trust className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
            {["Sin tarjeta de crédito", "3 sesiones gratis al mes", "Cancela cuando quieras"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — mock floating cards ── */}
        <div
          ref={cardsRef}
          className="hero-cards relative hidden md:col-span-2 md:flex md:items-center md:justify-center"
        >
          {/* Back card */}
          <div
            className="absolute inset-x-4 top-4 rounded-2xl border border-stone-200 bg-white/70 p-5 shadow-lg dark:border-stone-700 dark:bg-stone-800/60"
            style={{ transform: "rotate(-1deg) scale(0.95)", opacity: 0.55 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                LA
              </div>
              <div>
                <p className="font-display font-semibold text-stone-900 dark:text-stone-50">Laura Álvarez</p>
                <p className="text-xs text-teal-600 dark:text-teal-400">Coaching Ejecutivo</p>
              </div>
            </div>
          </div>

          {/* Front card */}
          <div
            className="relative z-10 w-full rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-700 dark:bg-stone-900"
            style={{ transform: "rotate(2deg)" }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-600 text-lg font-bold text-white">
                MC
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-semibold text-stone-900 dark:text-stone-50">María Castillo</p>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    ⭐ Destacada
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-400">Mentoría de Carrera · 8 años exp.</p>
                <div className="mt-1.5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs text-stone-500">4.9 (63 reseñas)</span>
                </div>
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
              Ayudo a profesionales en transiciones de carrera, negociación salarial y construcción de marca personal.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {["LinkedIn", "Salarios", "Entrevistas"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">Gratis · 3/mes</span>
              <span className="rounded-lg bg-teal-700 px-4 py-1.5 text-xs font-semibold text-white">
                Ver perfil →
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
