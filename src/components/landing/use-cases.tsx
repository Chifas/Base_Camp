"use client";

import { useRef } from "react";
import Link from "next/link";
import { Rocket, GitBranch, GraduationCap, Battery, ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const USE_CASES = [
  {
    icon: GitBranch,
    title: "Cambio de sector o carrera",
    description:
      "Quieres salir de tu sector actual pero no sabes cómo posicionarte ni qué pasos dar primero.",
    bullets: ["Plan de transición personalizado", "Reescribir CV y LinkedIn", "Roleplays de entrevistas"],
    cta: "Habla con un mentor de carrera",
    href: "/explore?category=CAREER_MENTOR",
    accent: "from-teal-500/15 to-teal-500/0",
    iconBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    icon: Rocket,
    title: "Crecer a manager o director",
    description:
      "Acabas de saltar a un rol de liderazgo o quieres acelerar tu camino hacia él.",
    bullets: ["Gestión de equipos y delegación", "Difíciles conversaciones 1:1", "Influencia y política interna"],
    cta: "Habla con un coach ejecutivo",
    href: "/explore?category=COACH",
    accent: "from-amber-500/15 to-amber-500/0",
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    icon: GraduationCap,
    title: "Recién licenciado o junior",
    description:
      "Estás empezando tu carrera y quieres orientación de alguien que ya recorrió el camino.",
    bullets: ["Elegir primera empresa", "Negociar tu primera oferta", "Crear marca personal desde cero"],
    cta: "Habla con un mentor",
    href: "/explore?category=CAREER_MENTOR",
    accent: "from-sky-500/15 to-sky-500/0",
    iconBg: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
  {
    icon: Battery,
    title: "Burnout o desconexión",
    description:
      "Estás agotado, perdido o desmotivado. Necesitas un espacio para entender qué te está pasando.",
    bullets: ["Identificar causas del agotamiento", "Recuperar límites sanos", "Reconectar con propósito"],
    cta: "Habla con un psicólogo laboral",
    href: "/explore?category=PSYCHOLOGIST",
    accent: "from-rose-500/15 to-rose-500/0",
    iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
];

export function UseCases() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-uc-card]", sectionRef.current!);
      gsap.set(cards, { y: 28 });
      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="use-cases-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-stone-50 py-20 dark:border-stone-800/60 dark:bg-stone-900/40 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#0d737710_1px,transparent_1px)] [background-size:32px_32px] opacity-50"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Para ti, sea cual sea tu momento
          </p>
          <h2 id="use-cases-title" className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            ¿En qué punto de tu carrera estás?
          </h2>
          <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
            Reconócete y encuentra al profesional que mejor te puede acompañar.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {USE_CASES.map((uc) => (
            <Link
              key={uc.title}
              href={uc.href}
              data-uc-card
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-700"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${uc.accent} blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl ${uc.iconBg}`}>
                <uc.icon className="h-6 w-6" aria-hidden="true" />
              </div>

              <h3 className="relative mt-5 font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
                {uc.title}
              </h3>
              <p className="relative mt-2 text-stone-700 dark:text-stone-300 leading-relaxed">
                {uc.description}
              </p>

              <ul className="relative mt-4 space-y-1.5">
                {uc.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-display font-semibold text-teal-700 dark:text-teal-400">
                {uc.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
