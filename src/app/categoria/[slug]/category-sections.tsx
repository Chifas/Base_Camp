"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Star,
  ArrowRight,
  Users,
  Compass,
  Target,
  Brain,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

// ── Icon map ────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Target,
  Brain,
  Apple,
};

// ── Color utility maps ──────────────────────────────────────────────────────

const gradientMap: Record<string, string> = {
  indigo: "from-indigo-600 via-indigo-500 to-blue-500",
  violet: "from-violet-600 via-violet-500 to-purple-500",
  emerald: "from-emerald-600 via-emerald-500 to-teal-500",
  orange: "from-orange-600 via-orange-500 to-amber-500",
};

const lightBgMap: Record<string, string> = {
  indigo: "bg-indigo-50 dark:bg-indigo-950/30",
  violet: "bg-violet-50 dark:bg-violet-950/30",
  emerald: "bg-emerald-50 dark:bg-emerald-950/30",
  orange: "bg-orange-50 dark:bg-orange-950/30",
};

const iconColorMap: Record<string, string> = {
  indigo: "text-indigo-600 dark:text-indigo-400",
  violet: "text-violet-600 dark:text-violet-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  orange: "text-orange-600 dark:text-orange-400",
};

const badgeBgMap: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

// ── Types ───────────────────────────────────────────────────────────────────

export interface CategoryHeroProps {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  professionalCount: number;
}

export interface CategoryDescriptionProps {
  description: string;
  benefits: string[];
  color: string;
}

export interface ProfessionalCardData {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface CategoryProfessionalsProps {
  professionals: ProfessionalCardData[];
  title: string;
  color: string;
}

export interface CategoryCTAProps {
  title: string;
  slug: string;
  color: string;
}

// ── Hero section ────────────────────────────────────────────────────────────

export function CategoryHero({
  title,
  subtitle,
  icon,
  color,
  professionalCount,
}: CategoryHeroProps) {
  const IconComponent = iconMap[icon] ?? Compass;
  const gradient = gradientMap[color] ?? gradientMap.indigo;

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${gradient} py-20 sm:py-28`}>
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
            >
              <IconComponent className="h-8 w-8 text-white" />
            </motion.div>

            {/* Title */}
            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-lg text-white/85 sm:text-xl">
              {subtitle}
            </p>

            {/* Stats badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Users className="h-4 w-4" />
                {professionalCount} profesional{professionalCount !== 1 ? "es" : ""} disponible{professionalCount !== 1 ? "s" : ""}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                3 sesiones gratis al mes
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Description + Benefits section ──────────────────────────────────────────

export function CategoryDescription({
  description,
  benefits,
  color,
}: CategoryDescriptionProps) {
  const lightBg = lightBgMap[color] ?? lightBgMap.indigo;
  const iconColor = iconColorMap[color] ?? iconColorMap.indigo;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Description text */}
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {description}
          </p>
        </FadeIn>

        {/* Benefits grid */}
        <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" delay={0.15}>
          {benefits.map((benefit, i) => (
            <StaggerItem key={i}>
              <div
                className={`flex h-full items-start gap-4 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${lightBg}`}
              >
                <div className="shrink-0 pt-0.5">
                  <CheckCircle2 className={`h-6 w-6 ${iconColor}`} />
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {benefit}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ── Featured professionals section ──────────────────────────────────────────

export function CategoryProfessionals({
  professionals,
  title,
  color,
}: CategoryProfessionalsProps) {
  const badgeBg = badgeBgMap[color] ?? badgeBgMap.indigo;

  if (professionals.length === 0) {
    return (
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {title}
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Profesionales destacados
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Estamos incorporando profesionales en esta especialidad. Pronto
              encontrarás expertos verificados disponibles para ti.
            </p>
          </FadeIn>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {title}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Profesionales destacados
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Conoce a algunos de nuestros expertos mejor valorados en esta
            especialidad.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" delay={0.15}>
          {professionals.map((pro) => (
            <StaggerItem key={pro.id}>
              <Link
                href={`/professional/${pro.id}`}
                className="group block h-full"
              >
                <div className="glass h-full overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex gap-4 p-5">
                    {/* Avatar */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={pro.image || "/placeholder-avatar.png"}
                        alt={pro.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-heading text-base font-semibold transition-colors group-hover:text-primary">
                          {pro.name}
                        </h3>
                        {pro.verified && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        )}
                      </div>
                      {pro.headline && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {pro.headline}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">
                            {pro.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({pro.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeBg}`}>
                      Gratuito
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ver perfil
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
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

// ── CTA section ─────────────────────────────────────────────────────────────

export function CategoryCTA({ title, slug, color }: CategoryCTAProps) {
  const gradient = gradientMap[color] ?? gradientMap.indigo;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-8 sm:p-12 lg:p-16`}
          >
            {/* Decorative */}
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Explora todos los {title.toLowerCase()}
              </h2>
              <p className="mt-4 text-base text-white/85 sm:text-lg">
                Encuentra al profesional ideal para ti. Tus primeras 3 sesiones
                de cada mes son completamente gratis.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 rounded-full bg-white text-zinc-900 hover:bg-white/90 font-semibold"
                  asChild
                >
                  <Link href={`/explore?category=${slug}`}>
                    Ver todos los profesionales
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2 rounded-full text-white hover:bg-white/20 border border-white/30"
                  asChild
                >
                  <Link href="/auth/register">
                    Regístrate gratis
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
