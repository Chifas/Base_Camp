"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  Compass,
  Lightbulb,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
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
      "Burnout, estrés, dinámicas de equipo y bienestar en el trabajo con psicólogos organizacionales.",
    color: "from-rose-500/10 to-orange-500/10",
    iconColor: "text-rose-500",
    borderHover: "hover:border-rose-500/30",
    count: "45+",
    trend: "↑ 18% este mes",
  },
  {
    slug: "COACH",
    icon: Target,
    title: "Coaching Ejecutivo",
    description:
      "Liderazgo, toma de decisiones y desarrollo directivo con coaches certificados ICF.",
    color: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
    borderHover: "hover:border-blue-500/30",
    count: "38+",
    trend: "↑ 12% este mes",
  },
  {
    slug: "CAREER_MENTOR",
    icon: Compass,
    title: "Mentoría de Carrera",
    description:
      "Transiciones, entrevistas, negociación salarial y marca personal con mentores senior.",
    color: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
    borderHover: "hover:border-violet-500/30",
    count: "52+",
    trend: "↑ 23% este mes",
  },
  {
    slug: "NUTRITIONIST",
    icon: Lightbulb,
    title: "Especialistas Sectoriales",
    description:
      "Product management, fintech, startups y estrategia con expertos del sector.",
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
    borderHover: "hover:border-emerald-500/30",
    count: "30+",
    trend: "↑ 9% este mes",
  },
];

export function Categories() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Especialidades
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            ¿En qué necesitas orientación?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra al profesional adecuado según tu situación y tus
            objetivos.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" delay={0.2}>
          {categories.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/explore?category=${cat.slug}`}
                className="group block h-full"
              >
                <div
                  className={`relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 card-glow ${cat.borderHover}`}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  {/* Decorative watermark icon */}
                  <cat.icon className="absolute -top-2 -right-2 h-20 w-20 text-current opacity-[0.04] rotate-12" />

                  <div className="relative">
                    {/* Icon with spring bounce */}
                    <motion.div
                      whileHover={{ rotate: 8, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80 ${cat.iconColor} transition-colors duration-300`}
                    >
                      <cat.icon className="h-6 w-6" />
                    </motion.div>

                    {/* Count badge */}
                    <span className="absolute right-0 top-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {cat.count} profesionales
                    </span>

                    <h3 className="mt-5 font-heading text-lg font-semibold">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Trend line */}
                    <p className="mt-3 flex items-center gap-1 text-xs font-medium text-primary/70">
                      <TrendingUp className="h-3 w-3" />
                      {cat.trend}
                    </p>

                    {/* Arrow link */}
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0">
                      Explorar
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </div>
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
