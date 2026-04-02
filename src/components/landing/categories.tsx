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
    color: "from-rose-500/15 to-orange-500/10",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10 group-hover:bg-rose-500/20",
    accentBar: "from-rose-500 to-orange-400",
    count: "45+",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching Ejecutivo",
    description: "Liderazgo, toma de decisiones y desarrollo directivo con coaches certificados ICF.",
    color: "from-blue-500/15 to-cyan-500/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    accentBar: "from-blue-500 to-cyan-400",
    count: "38+",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de Carrera",
    description: "Transiciones, entrevistas, negociación salarial y marca personal con mentores senior.",
    color: "from-violet-500/15 to-purple-500/10",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
    accentBar: "from-violet-500 to-purple-400",
    count: "52+",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas Sectoriales",
    description: "Product management, fintech, startups y estrategia con expertos del sector.",
    color: "from-emerald-500/15 to-teal-500/10",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    accentBar: "from-emerald-500 to-teal-400",
    count: "30+",
  },
];

export function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-cat-card]", sectionRef.current!);

      // Clip-path wipe-up reveal via ScrollTrigger.batch
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

      // quickTo 3D tilt on hover
      const cleanups: Array<() => void> = [];

      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>("[data-card-inner]");
        if (!inner) return;

        const xTo = gsap.quickTo(inner, "rotateY", { duration: 0.5, ease: "power3.out" });
        const yTo = gsap.quickTo(inner, "rotateX", { duration: 0.5, ease: "power3.out" });

        const onMove = contextSafe!((e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
          const y = -((e.clientY - rect.top) / rect.height - 0.5) * 14;
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
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Especialidades
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            ¿En qué necesitas orientación?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
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
                  className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-shadow duration-300 hover:shadow-2xl"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Top accent bar */}
                  <div className={`absolute left-0 top-0 h-1 w-0 bg-gradient-to-r ${cat.accentBar} transition-all duration-500 group-hover:w-full rounded-t-2xl`} />

                  {/* Gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                  <div className="relative">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.iconBg} ${cat.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <cat.icon className="h-6 w-6" />
                    </div>

                    <span className="absolute right-0 top-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {cat.count} pros
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-semibold">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
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
