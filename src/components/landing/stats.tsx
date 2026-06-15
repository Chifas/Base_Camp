"use client";

import { useRef } from "react";
import { Users, Calendar, Star, Globe2 } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

const STATS = [
  {
    icon: Users,
    target: 247,
    suffix: "+",
    label: "Profesionales verificados",
    sub: "Coaches, mentores y psicólogos",
    accent: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: Calendar,
    target: 4860,
    suffix: "+",
    label: "Sesiones completadas",
    sub: "Desde el lanzamiento de la beta",
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Star,
    target: 4.9,
    decimals: 1,
    suffix: "/5",
    label: "Valoración media",
    sub: "Sobre +2.300 reseñas verificadas",
    accent: "text-stone-700 dark:text-stone-200",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
  {
    icon: Globe2,
    target: 12,
    suffix: "",
    label: "Idiomas disponibles",
    sub: "Para clientes y profesionales",
    accent: "text-stone-700 dark:text-stone-200",
    bg: "bg-stone-100 dark:bg-stone-800",
  },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-stat-card]", sectionRef.current!);
      gsap.set(cards, { y: 24 });
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="stats-title"
      className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/30 to-white py-16 dark:from-stone-950 dark:via-teal-950/10 dark:to-stone-950 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Cifras reales
          </p>
          <h2 id="stats-title" className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            La plataforma de orientación profesional que está creciendo más rápido en España
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              data-stat-card
              className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.accent}`} aria-hidden="true" />
              </div>
              <p className={`mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${stat.accent}`}>
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  {...(stat.decimals !== undefined ? { decimals: stat.decimals } : {})}
                />
              </p>
              <p className="mt-2 text-sm font-display font-semibold text-stone-900 dark:text-stone-50">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{stat.sub}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-stone-400 dark:text-stone-500">
          Cifras actualizadas mensualmente · Última actualización: junio 2026
        </p>
      </div>
    </section>
  );
}
