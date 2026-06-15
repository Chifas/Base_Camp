"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookOpen, ArrowUpRight, FileText, Mic } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const RESOURCES = [
  {
    type: "Guía gratuita",
    icon: FileText,
    title: "Cómo identificar (y salir de) un burnout antes de quemarte",
    excerpt:
      "8 señales tempranas, 5 conversaciones que debes tener y un plan de 30 días para recuperar el equilibrio.",
    readTime: "12 min de lectura",
    href: "/recursos/burnout",
    tag: "Bienestar laboral",
  },
  {
    type: "Artículo",
    icon: BookOpen,
    title: "Negociar tu salario sin parecer 'avaricioso': guion paso a paso",
    excerpt:
      "Frases concretas para responder a las 4 objeciones más comunes en la conversación de revisión salarial.",
    readTime: "9 min de lectura",
    href: "/recursos/negociar-salario",
    tag: "Carrera",
  },
  {
    type: "Podcast",
    icon: Mic,
    title: "Cómo Sofía pasó de UX Senior a Lead en 4 meses",
    excerpt:
      "Entrevistamos a una de nuestras clientas sobre el proceso real de promoción interna en una scaleup.",
    readTime: "28 min",
    href: "/recursos/podcast-sofia",
    tag: "Casos reales",
  },
];

export function Resources() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-res-card]", sectionRef.current!);
      gsap.set(cards, { y: 24 });
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { y: 0, duration: 0.65, ease: "power3.out", stagger: 0.1 }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="resources-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-white py-20 dark:border-stone-800/60 dark:bg-stone-950 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              Recursos
            </p>
            <h2 id="resources-title" className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              Aprende algo nuevo en tu próximo café
            </h2>
            <p className="mt-3 text-base text-stone-700 dark:text-stone-300">
              Guías, artículos y conversaciones reales con profesionales de nuestro panel.
            </p>
          </div>
          <Link
            href="/recursos"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-display font-semibold text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-teal-700"
          >
            Ver todos
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </FadeIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              data-res-card
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800"
            >
              <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 to-amber-50 dark:from-teal-900/20 dark:to-amber-900/10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#0d737718_1px,transparent_1px)] [background-size:20px_20px]"
                />
                <r.icon className="relative h-14 w-14 text-teal-700 dark:text-teal-300" aria-hidden="true" />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                    {r.type}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">{r.readTime}</span>
                </div>

                <h3 className="mt-3 font-display text-base font-semibold leading-snug text-stone-900 transition-colors group-hover:text-teal-700 dark:text-stone-50 dark:group-hover:text-teal-400">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                  {r.excerpt}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
                  <span>{r.tag}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
