"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  Star,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { BentoGrid } from "@/components/bento/bento-grid";
import type { Professional } from "@/types";

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "mock-1",
    userId: "mock-u1",
    name: "Laura Sánchez",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
    bio: "Executive Coach con 12 años de experiencia en liderazgo.",
    headline: "Executive Coach · Experta en liderazgo femenino",
    category: "COACH",
    categoryName: "Coaching Ejecutivo",
    hourlyRate: 0,
    rating: 4.9,
    reviewCount: 87,
    verified: true,
    availability: [{ id: "a1", dayOfWeek: 1, startTime: "09:00", endTime: "18:00" }],
  },
  {
    id: "mock-2",
    userId: "mock-u2",
    name: "Carlos Moreno",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    bio: "Mentor de carrera para perfiles tech senior.",
    headline: "Career Mentor · Ex-EM en Spotify",
    category: "CAREER_MENTOR",
    categoryName: "Mentoría de Carrera",
    hourlyRate: 0,
    rating: 4.8,
    reviewCount: 134,
    verified: true,
    availability: [{ id: "a2", dayOfWeek: 2, startTime: "10:00", endTime: "17:00" }],
  },
  {
    id: "mock-3",
    userId: "mock-u3",
    name: "Elena Torres",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    bio: "Psicóloga organizacional especializada en burnout.",
    headline: "Psicóloga Laboral · Burnout & bienestar",
    category: "PSYCHOLOGIST",
    categoryName: "Psicología Laboral",
    hourlyRate: 0,
    rating: 4.7,
    reviewCount: 62,
    verified: true,
    availability: [{ id: "a3", dayOfWeek: 3, startTime: "09:00", endTime: "19:00" }],
  },
  {
    id: "mock-4",
    userId: "mock-u4",
    name: "Marcos Ibáñez",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos",
    bio: "Experto en estrategia de producto y fintech.",
    headline: "Especialista · Product Strategy & Fintech",
    category: "NUTRITIONIST",
    categoryName: "Especialistas Sectoriales",
    hourlyRate: 0,
    rating: 4.6,
    reviewCount: 41,
    verified: false,
    availability: [{ id: "a4", dayOfWeek: 4, startTime: "11:00", endTime: "18:00" }],
  },
  {
    id: "mock-5",
    userId: "mock-u5",
    name: "Sara Ruiz",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    bio: "Coach ejecutiva certificada ICF con enfoque en liderazgo.",
    headline: "Coach ICF · Liderazgo y comunicación",
    category: "COACH",
    categoryName: "Coaching Ejecutivo",
    hourlyRate: 0,
    rating: 4.9,
    reviewCount: 98,
    verified: true,
    availability: [{ id: "a5", dayOfWeek: 5, startTime: "09:00", endTime: "18:00" }],
  },
  {
    id: "mock-6",
    userId: "mock-u6",
    name: "Javier Peña",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javier",
    bio: "Mentor de carrera en tech y startups.",
    headline: "Career Mentor · Transiciones en tech",
    category: "CAREER_MENTOR",
    categoryName: "Mentoría de Carrera",
    hourlyRate: 0,
    rating: 4.8,
    reviewCount: 73,
    verified: true,
    availability: [{ id: "a6", dayOfWeek: 6, startTime: "10:00", endTime: "17:00" }],
  },
];

// ── Skeleton components ────────────────────────────────────────────────────────

function BentoSkeletonCard({ span }: { span: string }) {
  return (
    <div className={`${span} rounded-3xl bg-muted animate-pulse min-h-[240px]`} />
  );
}

export function FeaturedProfessionalsSkeleton() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="h-8 w-72 rounded bg-muted animate-pulse" />
          <div className="h-5 w-96 rounded bg-muted/60 animate-pulse" />
        </div>
        <BentoGrid columns={12} gap="normal" className="mt-12">
          <BentoSkeletonCard span="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 row-span-2 min-h-[520px]" />
          <BentoSkeletonCard span="col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4" />
          <BentoSkeletonCard span="col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4" />
          <BentoSkeletonCard span="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4" />
          <BentoSkeletonCard span="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4" />
          <BentoSkeletonCard span="col-span-2 sm:col-span-4 md:col-span-2 lg:col-span-4" />
        </BentoGrid>
      </div>
    </section>
  );
}

// ── Tone mapping for bento cards ───────────────────────────────────────────────

type ProTone = "dark" | "glass" | "primary" | "emerald" | "amber" | "violet" | "rose";

const TONE_SURFACE: Record<ProTone, string> = {
  dark: "bg-zinc-950 text-white",
  glass:
    "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-white/40 dark:border-white/10",
  primary:
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white",
  emerald: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
  amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
  violet: "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white",
  rose: "bg-gradient-to-br from-rose-500 to-pink-600 text-white",
};

type Layout = {
  tone: ProTone;
  span: string;
  variant: "hero" | "compact";
};

// 6-card bento: hero on left spans 8 cols / 2 rows, 2 compact stack on the right,
// 3 compact cards across the bottom.
const LAYOUT: Layout[] = [
  {
    tone: "dark",
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 row-span-2",
    variant: "hero",
  },
  {
    tone: "glass",
    span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4",
    variant: "compact",
  },
  {
    tone: "primary",
    span: "col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4",
    variant: "compact",
  },
  {
    tone: "emerald",
    span: "col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4",
    variant: "compact",
  },
  {
    tone: "amber",
    span: "col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4",
    variant: "compact",
  },
  {
    tone: "violet",
    span: "col-span-2 sm:col-span-4 md:col-span-2 lg:col-span-4",
    variant: "compact",
  },
];

// ── Main component ─────────────────────────────────────────────────────────────

interface FeaturedProfessionalsProps {
  professionals: Professional[];
}

export function FeaturedProfessionals({ professionals }: FeaturedProfessionalsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Pad to 6 if fewer are returned by the DB
  const source = professionals.length > 0 ? professionals : MOCK_PROFESSIONALS;
  const items: Professional[] = [];
  for (let i = 0; i < 6; i++) {
    items.push(source[i % source.length]);
  }

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-pro-card]", root);
      if (!cards.length) return;

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 48, scale: 0.96 });
      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: { amount: 0.45 },
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Nuestra comunidad
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Profesionales destacados
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Los perfiles mejor valorados por nuestra comunidad esta semana.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/explore" className="inline-flex items-center gap-2">
              Ver todos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <BentoGrid columns={12} gap="normal" className="mt-14">
          {items.map((pro, i) => {
            const layout = LAYOUT[i] ?? LAYOUT[LAYOUT.length - 1];
            const isHero = layout.variant === "hero";
            const isDark = layout.tone !== "glass";

            return (
              <Link
                key={`${pro.id}-${i}`}
                href={`/professional/${pro.id}`}
                data-pro-card
                className={`group relative overflow-hidden rounded-3xl border ${
                  layout.tone === "glass"
                    ? "border-white/40 dark:border-white/10"
                    : "border-white/10"
                } ${TONE_SURFACE[layout.tone]} ${layout.span} ${
                  isHero ? "min-h-[520px]" : "min-h-[260px]"
                } flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl`}
              >
                {/* Aurora for hero */}
                {isHero && (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(50% 50% at 90% 80%, rgba(236,72,153,0.35) 0%, transparent 65%)",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />
                  </>
                )}

                {/* Photo section */}
                <div
                  className={`relative w-full overflow-hidden ${
                    isHero ? "h-[65%]" : "aspect-[5/4]"
                  }`}
                >
                  <Image
                    src={
                      pro.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`
                    }
                    alt={pro.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes={
                      isHero
                        ? "(min-width: 1024px) 700px, 100vw"
                        : "(min-width: 1024px) 340px, 50vw"
                    }
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isHero
                        ? "from-zinc-950 via-zinc-950/30 to-transparent"
                        : isDark
                        ? "from-black/70 via-black/10 to-transparent"
                        : "from-black/55 via-black/5 to-transparent"
                    }`}
                  />

                  {/* Top-left category + top-right verified */}
                  <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-900 dark:bg-black/70 dark:text-white">
                      {pro.categoryName}
                    </span>
                    {pro.verified && (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-black/70">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </span>
                    )}
                  </div>

                  {isHero && (
                    <div className="absolute right-3 top-12 inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                      <Flame className="h-3 w-3" /> Top de la semana
                    </div>
                  )}
                </div>

                {/* Info section */}
                <div
                  className={`relative z-[1] flex flex-1 flex-col justify-between gap-4 ${
                    isHero ? "p-7 sm:p-8" : "p-5 sm:p-6"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-heading font-semibold leading-tight ${
                        isHero
                          ? "text-3xl sm:text-4xl"
                          : "text-lg sm:text-xl"
                      } ${isDark ? "text-white" : ""}`}
                    >
                      {pro.name}
                    </h3>
                    <p
                      className={`mt-1 line-clamp-2 text-sm ${
                        isDark ? "text-white/75" : "text-muted-foreground"
                      } ${isHero ? "sm:text-base" : ""}`}
                    >
                      {pro.headline}
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-between gap-2 border-t pt-4 ${
                      isDark ? "border-white/10" : "border-border/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span
                          className={`text-sm font-semibold ${
                            isDark ? "text-white" : ""
                          }`}
                        >
                          {pro.rating.toFixed(1)}
                        </span>
                      </div>
                      <span
                        className={`text-xs ${
                          isDark ? "text-white/60" : "text-muted-foreground"
                        }`}
                      >
                        ({pro.reviewCount})
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isDark
                          ? "bg-white/15 text-white ring-1 ring-white/20"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      Gratis
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </BentoGrid>

        <div className="mt-10 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/explore" className="inline-flex items-center gap-2">
              Ver todos los profesionales
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
