"use client";

import { useRef } from "react";
import { Brain, Target, Compass, Lightbulb, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";

type Category = {
  slug: string;
  icon: typeof Brain;
  title: string;
  description: string;
  count: string;
  tone: "violet" | "emerald" | "amber" | "rose" | "primary" | "dark";
  span: string;
};

const categories: Category[] = [
  {
    slug: "PSYCHOLOGIST",
    icon: Brain,
    title: "Psicología laboral",
    description:
      "Burnout, estrés, dinámicas de equipo y bienestar con psicólogos organizacionales.",
    count: "45+",
    tone: "rose",
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-7",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching ejecutivo",
    description:
      "Liderazgo y decisiones con coaches certificados ICF.",
    count: "38+",
    tone: "primary",
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-5",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de carrera",
    description:
      "Transiciones, entrevistas, marca personal y negociación salarial.",
    count: "52+",
    tone: "violet",
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-5",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas sectoriales",
    description:
      "Product management, fintech, estrategia y startups con expertos del sector.",
    count: "30+",
    tone: "emerald",
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-7",
  },
];

export function Categories() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

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

      gsap.set(cards, { opacity: 0, y: 48, scale: 0.95 });

      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: { amount: 0.4 },
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Especialidades
          </p>
          <h2
            ref={headingRef}
            className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl"
          >
            ¿En qué necesitas orientación?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra al profesional adecuado según tu situación y tus objetivos.
          </p>
        </div>

        <BentoGrid columns={12} gap="normal" className="mt-14">
          {categories.map((cat) => (
            <BentoCard
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              span={cat.span}
              tone={cat.tone}
              interactive
              noBorder
              icon={<cat.icon className="h-5 w-5" />}
              eyebrow={`${cat.count} pros`}
              title={cat.title}
              description={cat.description}
              footer={
                <span className="inline-flex items-center gap-1 font-semibold">
                  Explorar <ArrowUpRight className="h-4 w-4" />
                </span>
              }
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
