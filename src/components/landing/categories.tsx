"use client";

import Link from "next/link";
import { useRef } from "react";
import { Brain, Target, Compass, Lightbulb, ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const categories = [
  {
    slug: "PSYCHOLOGIST",
    icon: Brain,
    title: "Psicología Laboral",
    description:
      "Burnout, estrés, dinámicas de equipo y bienestar en el trabajo con psicólogos organizacionales.",
    count: "45+",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching Ejecutivo",
    description:
      "Liderazgo, toma de decisiones y desarrollo directivo con coaches certificados ICF.",
    count: "38+",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de Carrera",
    description:
      "Transiciones, entrevistas, negociación salarial y marca personal con mentores senior.",
    count: "52+",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas Sectoriales",
    description:
      "Product management, fintech, startups y estrategia con expertos del sector.",
    count: "30+",
  },
];

export function Categories() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-cat-card]", sectionRef.current!);

      gsap.set(cards, { y: 24 });

      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: { amount: 0.3 },
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-20 sm:py-28">
      {/* Soft accent — keeps section airy but not flat */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-teal-100/50 blur-3xl dark:bg-teal-900/20"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-display font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
            Especialidades
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
            ¿En qué necesitas orientación?
          </h2>
          <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
            Encuentra al profesional adecuado según tu situación y tus objetivos.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.slug} data-cat-card>
              <Link href={`/explore?category=${cat.slug}`} className="group block h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-700/5 dark:hover:border-teal-800/60 dark:hover:shadow-teal-500/10">
                  {/* Soft hover glow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-200/0 blur-2xl transition-all duration-500 group-hover:bg-teal-200/60 dark:group-hover:bg-teal-500/20"
                  />
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 transition-colors duration-300 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50">
                    <cat.icon className="h-6 w-6 text-teal-700 dark:text-teal-400" />
                  </div>

                  {/* Count badge */}
                  <span className="absolute right-4 top-4 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                    {cat.count} pros
                  </span>

                  <h3 className="mt-5 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-sm font-display font-medium text-teal-700 dark:text-teal-400 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Explorar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
