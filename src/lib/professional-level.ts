/**
 * Tier system for professionals — drives gamification and trust signals.
 * Based on lifetime sessions completed.
 */

export type LevelKey = "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "EXPERT";

export interface LevelInfo {
  key:      LevelKey;
  label:    string;
  /** Minimum sessions to reach this level. */
  threshold: number;
  /** Tailwind classes for badge background and text. */
  badgeClass: string;
  /** Short description shown in tooltips. */
  description: string;
}

export const LEVELS: readonly LevelInfo[] = [
  {
    key:        "JUNIOR",
    label:      "Junior",
    threshold:  0,
    badgeClass: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    description: "Profesional en sus primeros pasos en GuidePath.",
  },
  {
    key:        "INTERMEDIATE",
    label:      "Intermedio",
    threshold:  10,
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    description: "10+ sesiones completadas con buenas valoraciones.",
  },
  {
    key:        "SENIOR",
    label:      "Senior",
    threshold:  50,
    badgeClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    description: "50+ sesiones completadas. Profesional con trayectoria sólida.",
  },
  {
    key:        "EXPERT",
    label:      "Experto",
    threshold:  150,
    badgeClass: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/40 dark:to-amber-800/40 dark:text-amber-300",
    description: "150+ sesiones completadas. Top performer de la plataforma.",
  },
] as const;

export interface CurrentLevel {
  current:       LevelInfo;
  next:          LevelInfo | null;
  /** Sessions remaining to reach next level (null if max). */
  toNext:        number | null;
  /** Progress 0..1 toward next level. */
  progress:      number;
  totalSessions: number;
}

export function getProfessionalLevel(totalSessions: number): CurrentLevel {
  // Walk levels from top down to find the matching tier
  let current: LevelInfo = LEVELS[0]!;
  for (const level of LEVELS) {
    if (totalSessions >= level.threshold) current = level;
  }

  const currentIdx = LEVELS.findIndex((l) => l.key === current.key);
  const next       = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] ?? null : null;

  if (!next) {
    return { current, next: null, toNext: null, progress: 1, totalSessions };
  }

  const span    = next.threshold - current.threshold;
  const within  = totalSessions - current.threshold;
  const progress = span > 0 ? Math.min(1, Math.max(0, within / span)) : 1;

  return {
    current,
    next,
    toNext:   Math.max(0, next.threshold - totalSessions),
    progress,
    totalSessions,
  };
}
