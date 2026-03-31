"use client";

import Link from "next/link";
import { Brain, Target, Compass, Lightbulb, ArrowRight } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

const categories = [
  {
    slug: "PSYCHOLOGIST",
    icon: Brain,
    title: "Psicología Laboral",
    description:
      "Burnout, estrés y bienestar en el trabajo con psicólogos organizacionales.",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-500",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching Ejecutivo",
    description:
      "Liderazgo y desarrollo directivo con coaches certificados ICF.",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de Carrera",
    description:
      "Transiciones, entrevistas y negociación salarial con mentores senior.",
    iconBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-500",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas Sectoriales",
    description:
      "Product, fintech, startups y estrategia con expertos del sector.",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
  },
];

export function Categories() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            ¿En qué necesitas orientación?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra al profesional adecuado según tu situación.
          </p>
        </FadeIn>

        <StaggerContainer
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          delay={0.1}
        >
          {categories.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/explore?category=${cat.slug}`}
                className="group block h-full"
              >
                <div className="flex h-full flex-col rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${cat.iconBg} ${cat.iconColor}`}
                  >
                    <cat.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-heading text-lg font-semibold">
                    {cat.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Explorar
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
