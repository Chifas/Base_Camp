"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface ProfileData {
  headline?: string | null;
  bio?: string | null;
  image?: string | null;
  category?: string | null;
  languages?: string[];
  yearsExperience?: number | null;
  availability?: unknown[];
}

interface Step {
  label: string;
  done: boolean;
  href?: string;
}

export default function ProfileCompleteness({ profile }: { profile: ProfileData }) {
  const steps: Step[] = useMemo(
    () => [
      { label: "Categoría profesional", done: !!profile.category },
      { label: "Titular profesional", done: !!profile.headline },
      { label: "Biografía", done: !!profile.bio, href: "/dashboard/professional" },
      {
        label: "Al menos 1 día de disponibilidad",
        done: (profile.availability?.length ?? 0) > 0,
        href: "/dashboard/professional",
      },
      { label: "Foto de perfil", done: !!profile.image, href: "/dashboard/professional" },
      {
        label: "Idiomas",
        done: (profile.languages?.length ?? 0) > 0,
        href: "/dashboard/professional",
      },
    ],
    [profile]
  );

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((completed / total) * 100);

  if (pct === 100) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/20">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h3 className="font-semibold text-amber-900 dark:text-amber-100">
          Completa tu perfil — {pct}%
        </h3>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-200/50 dark:bg-amber-900/30">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="mt-3 space-y-1.5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            {!s.done && s.href ? (
              <Link href={s.href} className="text-primary hover:underline">
                {s.label}
              </Link>
            ) : (
              <span className={s.done ? "text-muted-foreground line-through" : ""}>
                {s.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Los perfiles completos reciben hasta 3x más reservas.
      </p>
    </div>
  );
}
