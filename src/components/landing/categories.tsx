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
    description: "Burnout, estrés, dinámicas de equipo y bienestar en el trabajo con psicólogos organizacionales.",
    iconBg: "bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50",
    iconColor: "text-teal-600 dark:text-teal-400",
    accentBar: "bg-teal-600",
    hoverBg: "group-hover:bg-teal-50/60 dark:group-hover:bg-teal-950/20",
    count: "45+",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching Ejecutivo",
    description: "Liderazgo, toma de decisiones y desarrollo directivo con coaches certificados ICF.",
    iconBg: "bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    accentBar: "bg-amber-500",
    hoverBg: "group-hover:bg-amber-50/60 dark:group-hover:bg-amber-950/20",
    count: "38+",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de Carrera",
    description: "Transiciones, entrevistas, negociación salarial y marca personal con mentores senior.",
    iconBg: "bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50",
    iconColor: "text-teal-700 dark:text-teal-300",
    accentBar: "bg-teal-700",
    hoverBg: "group-hover:bg-teal-50/60 dark:group-hover:bg-teal-950/20",
    count: "52+",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas Sectoriales",
    description: "Product management, fintech, startups y estrategia con expertos del sector.",
    iconBg: "bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-200 dark:group-hover:bg-stone-700",
    iconColor: "text-stone-600 dark:text-stone-400",
    accentBar: "bg-stone-500",
    hoverBg: "group-hover:bg-stone-50/60 dark:group-hover:bg-stone-900/40",
    count: "30+",
  },
];

export function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-cat-card]", sectionRef.current!);

      gsap.set(cards, { clipPath: "inset(0 0 100% 0)", opacity: 0 });

      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            clipPath: "inset(0 0 0% 0)",
            opacity: 1,
            duration: 0.85,
            ease: "expo.out",
            stagger: { amount: 0.4 },
          });
        },
      });

      // 3D tilt on hover
      const cleanups: Array<() => void> = [];

      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>("[data-card-inner]");
        if (!inner) return;

        const xTo = gsap.quickTo(inner, "rotateY", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(inner, "rotateX", { duration: 0.5, ease: "power3.out" });

        const onMove = contextSafe!((e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
          const y = -((e.clientY - rect.top) / rect.height - 0.5) * 10;
          gsap.set(inner, { transformPerspective: 900 });
          xTo(x);
          yTo(y);
        });

        const onLeave = contextSafe!(() => {
          xTo(0);
          yTo(0);
        });

        card.addEventListener("mousemove", onMove as EventListener);
        card.addEventListener("mouseleave", onLeave as EventListener);
        cleanups.push(() => {
          card.removeEventListener("mousemove", onMove as EventListener);
          card.removeEventListener("mouseleave", onLeave as EventListener);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        <div
          ref={gridRef}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((cat) => (
            <div
              key={cat.slug}
              data-cat-card
              style={{ clipPath: "inset(0 0 100% 0)", opacity: 0, transformStyle: "preserve-3d" }}
            >
              <Link href={`/explore?category=${cat.slug}`} className="group block h-full">
                <div
                  data-card-inner
                  className={`relative h-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 transition-all duration-300 hover:shadow-md ${cat.hoverBg}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Top accent bar */}
                  <div className={`absolute left-0 top-0 h-1 w-0 ${cat.accentBar} transition-all duration-500 group-hover:w-full rounded-t-2xl`} />

                  <div className="relative">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.iconBg} ${cat.iconColor} transition-all duration-300`}>
                      <cat.icon className="h-6 w-6" />
                    </div>

                    <span className="absolute right-0 top-0 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                      {cat.count} pros
                    </span>

                    <h3 className="mt-5 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className={`mt-5 flex items-center gap-1 text-sm font-display font-medium ${cat.iconColor} opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0`}>
                      Explorar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
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
