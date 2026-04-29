"use client";

/**
 * ProfileCompleteness — onboarding progress card for professionals.
 *
 * Customisable via the constants at the top of this file:
 *   - STEPS_CONFIG : the checklist (label, weight, deep-link href)
 *   - MILESTONES   : motivational copy by progress threshold
 *   - ACCENT       : color tokens for the card chrome
 *
 * Updating those should be enough for most visual / copy tweaks.
 */

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";

// ─── Customisation ──────────────────────────────────────────────────────────

interface ProfileData {
  headline?: string | null;
  bio?: string | null;
  image?: string | null;
  category?: string | null;
  languages?: string[];
  yearsExperience?: number | null;
  availability?: unknown[];
}

type StepKey =
  | "category"
  | "headline"
  | "bio"
  | "image"
  | "availability"
  | "languages"
  | "yearsExperience";

interface StepConfig {
  key: StepKey;
  label: string;
  /** Relative weight when computing percentage. */
  weight: number;
  /** Deep-link to the dashboard tab where this step is completed. */
  href: string;
}

const STEPS_CONFIG: ReadonlyArray<StepConfig> = [
  { key: "category",        label: "Categoría profesional",  weight: 15, href: "/dashboard/professional?tab=profile" },
  { key: "headline",        label: "Titular profesional",    weight: 15, href: "/dashboard/professional?tab=profile" },
  { key: "bio",             label: "Biografía",              weight: 20, href: "/dashboard/professional?tab=profile" },
  { key: "image",           label: "Foto de perfil",         weight: 15, href: "/dashboard/professional?tab=profile" },
  { key: "availability",    label: "Disponibilidad",         weight: 15, href: "/dashboard/professional?tab=availability" },
  { key: "languages",       label: "Idiomas",                weight: 10, href: "/dashboard/professional?tab=profile" },
  { key: "yearsExperience", label: "Años de experiencia",    weight: 10, href: "/dashboard/professional?tab=profile" },
];

const MILESTONES = [
  { threshold: 40,  emoji: "🚀", title: "Empieza aquí",      message: "Completa los pasos esenciales para empezar a aparecer en búsquedas." },
  { threshold: 80,  emoji: "✨", title: "Vas muy bien",      message: "Casi todo listo. Cada paso extra mejora tu visibilidad." },
  { threshold: 99,  emoji: "💪", title: "Último empujón",    message: "Solo te falta un detalle para tener un perfil 100% optimizado." },
] as const;

const ACCENT = {
  bgGradient:
    "bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-teal-950/30 dark:via-stone-950 dark:to-emerald-950/20",
  border:    "border-teal-100 dark:border-teal-900/40",
  ring:      "stroke-teal-500 dark:stroke-teal-400",
  ringTrack: "stroke-stone-200 dark:stroke-stone-800",
  text:      "text-teal-700 dark:text-teal-300",
  cta:       "bg-teal-600 hover:bg-teal-700 text-white",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function isStepDone(key: StepKey, profile: ProfileData): boolean {
  switch (key) {
    case "category":        return Boolean(profile.category);
    case "headline":        return Boolean(profile.headline && profile.headline.length >= 5);
    case "bio":             return Boolean(profile.bio && profile.bio.length >= 20);
    case "image":           return Boolean(profile.image);
    case "availability":    return (profile.availability?.length ?? 0) > 0;
    case "languages":       return (profile.languages?.length ?? 0) > 0;
    case "yearsExperience": return profile.yearsExperience !== null && profile.yearsExperience !== undefined;
  }
}

function pickMilestone(pct: number) {
  return MILESTONES.find((m) => pct < m.threshold) ?? MILESTONES[MILESTONES.length - 1]!;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProfileCompleteness({ profile }: { profile: ProfileData }) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  // Compute progress (weighted)
  const { pct, completedSteps, pendingSteps } = useMemo(() => {
    const evaluated = STEPS_CONFIG.map((s) => ({ ...s, done: isStepDone(s.key, profile) }));
    const totalWeight = evaluated.reduce((sum, s) => sum + s.weight, 0);
    const earnedWeight = evaluated.filter((s) => s.done).reduce((sum, s) => sum + s.weight, 0);
    return {
      pct: Math.round((earnedWeight / totalWeight) * 100),
      completedSteps: evaluated.filter((s) => s.done),
      pendingSteps: evaluated.filter((s) => !s.done),
    };
  }, [profile]);

  // SVG ring math: r=42, circumference = 2πr ≈ 263.89
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Animate ring on mount + when pct changes
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Skip animation: snap to final state
        if (ringRef.current) {
          ringRef.current.style.strokeDashoffset = String(circumference - (circumference * pct) / 100);
        }
        if (numberRef.current) numberRef.current.textContent = `${pct}`;
        return;
      }

      // Animate ring fill
      if (ringRef.current) {
        gsap.fromTo(
          ringRef.current,
          { strokeDashoffset: circumference },
          {
            strokeDashoffset: circumference - (circumference * pct) / 100,
            duration: 1.2,
            ease: "expo.out",
          }
        );
      }

      // Animate the numeric counter
      if (numberRef.current) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: pct,
          duration: 1.2,
          ease: "expo.out",
          onUpdate: () => {
            if (numberRef.current) numberRef.current.textContent = String(Math.round(counter.value));
          },
        });
      }
    },
    { scope: containerRef, dependencies: [pct, circumference] }
  );

  if (pct >= 100) return null;

  const milestone = pickMilestone(pct);
  const firstPending = pendingSteps[0];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border ${ACCENT.border} ${ACCENT.bgGradient} p-5 sm:p-6`}
    >
      <div className="flex items-start gap-4 sm:items-center sm:gap-6">
        {/* Circular progress ring */}
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              className={ACCENT.ringTrack}
            />
            <circle
              ref={ringRef}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              className={ACCENT.ring}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`font-display text-2xl font-bold sm:text-3xl ${ACCENT.text}`}>
              <span ref={numberRef}>0</span>
              <span className="text-base">%</span>
            </p>
          </div>
        </div>

        {/* Title + message */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${ACCENT.text}`} />
            <h3 className="font-display text-base font-semibold text-stone-900 sm:text-lg dark:text-stone-50">
              {milestone.title} {milestone.emoji}
            </h3>
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {milestone.message}
          </p>

          {firstPending ? (
            <Link
              href={firstPending.href}
              className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition-colors ${ACCENT.cta}`}
            >
              Continuar con: {firstPending.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Pending checklist */}
      <ul className="mt-5 space-y-2">
        {pendingSteps.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-sm">
            <Circle className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500" />
            <Link
              href={s.href}
              className="text-stone-700 hover:text-teal-700 hover:underline dark:text-stone-300 dark:hover:text-teal-300"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Completed (collapsed by default) */}
      {completedSteps.length > 0 && (
        <div className="mt-4 border-t border-stone-200/70 pt-3 dark:border-stone-800/70">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ocultar pasos completados ({completedSteps.length})
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver pasos completados ({completedSteps.length})
              </>
            )}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1.5">
              {completedSteps.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="line-through">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
