"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  Star,
  CheckCircle2,
  Award,
  Video,
  Clock,
  Globe,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { gsap, useGSAP } from "@/lib/gsap-config";

// Hash-based fallback gradient when no coverImage is set.
function getCoverGradient(name: string): string {
  const gradients = [
    "from-teal-400 via-emerald-300 to-amber-200",
    "from-sky-400 via-teal-300 to-emerald-200",
    "from-amber-300 via-orange-300 to-rose-300",
    "from-violet-400 via-fuchsia-300 to-rose-300",
    "from-emerald-400 via-teal-300 to-cyan-200",
    "from-rose-400 via-amber-300 to-yellow-200",
    "from-indigo-400 via-violet-300 to-pink-200",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradients.length;
  return gradients[index] ?? gradients[0]!;
}

interface ProfileHeroProps {
  name: string;
  image: string;
  coverImage?: string | null;
  headline: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  categoryLabel: string;
  yearsExperience?: number;
  languages: string[];
  hasAvailability: boolean;
}

export function ProfileHero({
  name,
  image,
  coverImage,
  headline,
  rating,
  reviewCount,
  verified,
  categoryLabel,
  yearsExperience,
  languages,
  hasAvailability,
}: ProfileHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  const gradient = getCoverGradient(name);
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ delay: 0.05 });
      tl.from(photoRef.current, {
        scale: 0.85,
        duration: 0.6,
        ease: "back.out(1.4)",
      })
        .from(
          nameRef.current,
          { x: -20, duration: 0.5, ease: "power3.out" },
          "-=0.3"
        )
        .from(
          metaRef.current,
          { y: 10, duration: 0.4, ease: "power2.out" },
          "-=0.2"
        )
        .from(
          pillsRef.current ? Array.from(pillsRef.current.children) : [],
          { y: 10, stagger: 0.07, duration: 0.4 },
          "-=0.1"
        );
    },
    { scope: heroRef }
  );

  return (
    <div ref={heroRef}>
      {/* Cover band — image if provided, otherwise hash-based gradient */}
      <div className="relative h-44 overflow-hidden sm:h-56 md:h-72 lg:h-80">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        {/* Subtle dot pattern overlay (always on top of cover) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="profile-hero-dots"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-stone-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#profile-hero-dots)" />
        </svg>

        {/* Bottom fade for text legibility on cover-image variant */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* Back button */}
        <Link
          href="/explore"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-stone-900/80 dark:text-stone-300 dark:hover:bg-stone-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a explorar
        </Link>
      </div>

      {/* Profile info */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-[64px] flex flex-col items-center sm:-mt-[72px] sm:flex-row sm:items-end sm:gap-6">
          {/* Photo (overlapping the cover) */}
          <div ref={photoRef} className="shrink-0">
            <div className="relative h-[120px] w-[120px] overflow-hidden rounded-3xl bg-stone-100 shadow-xl ring-4 ring-white dark:bg-stone-800 dark:ring-stone-900 sm:h-[144px] sm:w-[144px] lg:h-[160px] lg:w-[160px]">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-3xl font-bold text-white`}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Name + sub-info */}
          <div className="mt-4 min-w-0 flex-1 text-center sm:mt-0 sm:pb-3 sm:text-left">
            <div
              ref={nameRef}
              className="flex flex-col items-center gap-2 sm:flex-row sm:items-center"
            >
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl lg:text-[2.5rem]">
                {name}
              </h1>
              {verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                  title="Identidad verificada por GuidePath"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verificado
                </span>
              )}
            </div>
            <div ref={metaRef}>
              <p className="mt-1.5 text-lg font-medium text-teal-600 dark:text-teal-400 sm:text-xl">
                {headline}
              </p>
              {languages.length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-1.5 sm:justify-start">
                  <Globe className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {languages.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div
          ref={pillsRef}
          className="mt-6 flex flex-wrap justify-center gap-3 pb-2 sm:justify-start"
        >
          <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold tabular text-stone-900 dark:text-stone-50">
              {rating.toFixed(1)}
            </span>
            <span className="tabular text-stone-500">({reviewCount} reseñas)</span>
          </div>

          {yearsExperience && yearsExperience > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
              <Award className="h-4 w-4 text-teal-600" />
              <span className="text-stone-700 dark:text-stone-300">
                {yearsExperience} años de experiencia
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm dark:bg-stone-800">
            <Video className="h-4 w-4 text-teal-600" />
            <span className="text-stone-700 dark:text-stone-300">Sesiones 60 min</span>
          </div>

          {hasAvailability && (
            <div className="flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-2 text-sm dark:border-teal-800 dark:bg-teal-900/30">
              <Clock className="h-4 w-4 text-teal-600" />
              <span className="font-medium text-teal-700 dark:text-teal-400">
                Disponible esta semana
              </span>
            </div>
          )}

          <Badge className="h-auto rounded-full border-0 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
            {categoryLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
}
