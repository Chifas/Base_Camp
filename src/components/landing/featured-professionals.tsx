"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Star, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/motion-wrapper";
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
    headline: "Career Mentor · Ex-Engineering Manager en Spotify",
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
    headline: "Psicóloga Laboral · Burnout & bienestar en el trabajo",
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
    headline: "Especialista Sectorial · Product Strategy & Fintech",
    category: "NUTRITIONIST",
    categoryName: "Especialistas Sectoriales",
    hourlyRate: 0,
    rating: 4.6,
    reviewCount: 41,
    verified: false,
    availability: [{ id: "a4", dayOfWeek: 4, startTime: "11:00", endTime: "18:00" }],
  },
];

// ── Skeletons ─────────────────────────────────────────────────────────────────

export function ProfessionalCardSkeleton() {
  return (
    <div className="w-[280px] sm:w-[300px] shrink-0">
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-pulse">
        <div className="aspect-[4/5] bg-stone-100 dark:bg-stone-800" />
        <div className="flex items-center justify-between p-4">
          <div className="h-4 w-24 rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-6 w-16 rounded-full bg-stone-100 dark:bg-stone-800" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedProfessionalsSkeleton() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-72 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
      </div>
      <div className="mt-12 flex gap-6 overflow-hidden px-4 sm:px-6 lg:px-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProfessionalCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface FeaturedProfessionalsProps {
  professionals: Professional[];
}

export function FeaturedProfessionals({ professionals }: FeaturedProfessionalsProps) {
  const displayProfessionals = professionals.length > 0 ? professionals : MOCK_PROFESSIONALS;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth ?? 300;
    el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
  };

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex items-end justify-between">
          <div>
            <p className="text-sm font-display font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">
              Comunidad
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
              Profesionales destacados
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              Los mejor valorados por nuestra comunidad.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            </button>
            <Button variant="ghost" className="group ml-2 font-display font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30" asChild>
              <Link href="/explore">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="relative mt-10">
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-4 no-scrollbar"
        >
          {displayProfessionals.map((pro) => (
            <Link
              key={pro.id}
              href={`/professional/${pro.id}`}
              className="group w-[270px] sm:w-[290px] shrink-0 block"
            >
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={pro.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`}
                    alt={pro.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="290px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute left-3 top-3">
                    <Badge className="bg-white/90 text-stone-700 text-xs font-medium dark:bg-stone-900/80 dark:text-stone-200 border-0">
                      {pro.categoryName}
                    </Badge>
                  </div>

                  {pro.verified && (
                    <div className="absolute right-3 top-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 dark:bg-stone-900/80">
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {pro.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-white/80 line-clamp-1">
                      {pro.headline}
                    </p>
                  </div>
                </div>

                {/* Card bottom */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{pro.rating}</span>
                    <span className="text-sm text-stone-500 dark:text-stone-400">
                      ({pro.reviewCount})
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900/30 px-2.5 py-0.5 text-sm font-semibold text-teal-700 dark:text-teal-400">
                    Gratuito
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile view all */}
      <div className="mt-8 text-center md:hidden px-4">
        <Button variant="outline" className="border-stone-300 dark:border-stone-700" asChild>
          <Link href="/explore">
            Ver todos los profesionales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
