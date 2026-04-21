"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useRef } from "react";
import { Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";
import type { Professional } from "@/types";

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "mock-1",
    userId: "mock-u1",
    name: "Laura Sánchez",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura",
    bio: "Executive Coach con 12 años de experiencia ayudando a líderes a desarrollar su potencial, comunicar con impacto y tomar decisiones en entornos de alta presión.",
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
];

export function FeaturedProfessionalsSkeleton() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-72 rounded bg-stone-100 dark:bg-stone-800 animate-pulse" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeaturedProfessionalsProps {
  professionals: Professional[];
}

export const FeaturedProfessionals = memo(function FeaturedProfessionals({ professionals }: FeaturedProfessionalsProps) {
  const displayProfessionals =
    professionals.length > 0 ? professionals : MOCK_PROFESSIONALS;
  const featured = displayProfessionals[0];
  const rest = displayProfessionals.slice(1, 4);

  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-pro-card]", sectionRef.current!);
      gsap.set(cards, { opacity: 0, y: 28 });

      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.08,
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
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
          <Button
            variant="ghost"
            className="hidden md:flex group font-display font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30"
            asChild
          >
            <Link href="/explore">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </FadeIn>

        {/* Asymmetric grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Featured card — col-span-2 */}
          <div data-pro-card style={{ opacity: 0 }} className="sm:col-span-2">
            <Link href={`/professional/${featured.id}`} className="group block h-full">
              <div className="h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-start gap-5">
                  {/* Photo */}
                  <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
                    <Image
                      src={featured.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featured.name}`}
                      alt={featured.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl font-semibold text-stone-900 dark:text-stone-50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {featured.name}
                      </h3>
                      <span className="rounded-full bg-teal-100 dark:bg-teal-900/40 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                        ⭐ Destacado
                      </span>
                      {featured.verified && (
                        <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-teal-600 dark:text-teal-400 font-medium">
                      {featured.headline}
                    </p>

                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(featured.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-200 dark:text-stone-700"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-stone-700 dark:text-stone-300">
                        {featured.rating}
                      </span>
                      <span className="text-sm text-stone-400">
                        ({featured.reviewCount} reseñas)
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {featured.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-4">
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                    Gratis · 3 sesiones/mes
                  </span>
                  <Button
                    size="sm"
                    className="bg-teal-700 text-white hover:bg-teal-800 font-display"
                  >
                    Ver perfil
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>

          {/* Regular cards */}
          {rest.map((pro) => (
            <div key={pro.id} data-pro-card style={{ opacity: 0 }}>
              <Link href={`/professional/${pro.id}`} className="group block h-full">
                <div className="h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center text-center">
                  {/* Circular photo */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800 ring-2 ring-stone-100 dark:ring-stone-800">
                    <Image
                      src={pro.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`}
                      alt={pro.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <h3 className="mt-3 font-display text-base font-semibold text-stone-900 dark:text-stone-50 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {pro.name}
                  </h3>

                  <p className="mt-0.5 text-xs font-medium text-teal-600 dark:text-teal-400">
                    {pro.categoryName}
                  </p>

                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {pro.rating}
                    </span>
                    <span className="text-xs text-stone-400">({pro.reviewCount})</span>
                  </div>

                  <div className="mt-auto pt-4 w-full">
                    <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-400">
                      Disponible
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="border-stone-200 dark:border-stone-700" asChild>
            <Link href="/explore">
              Ver todos los profesionales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
});
