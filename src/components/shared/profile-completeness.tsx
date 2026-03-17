"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface ProfileData {
  category?: string;
  headline?: string | null;
  bio?: string | null;
  image?: string | null;
  hasAvailability?: boolean;
  hasCertifications?: boolean;
  languages?: string[];
  yearsExperience?: number | null;
}

interface Step {
  label: string;
  done: boolean;
  weight: number;
  suggestion: string;
  link?: string;
}

export function ProfileCompleteness({ profile }: { profile: ProfileData }) {
  const steps = useMemo<Step[]>(() => [
    {
      label: "Categoría profesional",
      done: !!profile.category,
      weight: 15,
      suggestion: "Selecciona tu especialidad",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Titular profesional",
      done: !!profile.headline,
      weight: 15,
      suggestion: "Añade un titular que describa tu perfil",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Biografía",
      done: !!profile.bio && profile.bio.length > 20,
      weight: 15,
      suggestion: "Cuenta tu experiencia y enfoque profesional",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Foto de perfil",
      done: !!profile.image,
      weight: 15,
      suggestion: "Añade tu foto para generar más confianza",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Disponibilidad",
      done: !!profile.hasAvailability,
      weight: 15,
      suggestion: "Configura tus horarios semanales",
      link: "/dashboard/professional?tab=availability",
    },
    {
      label: "Certificaciones",
      done: !!profile.hasCertifications,
      weight: 10,
      suggestion: "Añade tus certificaciones para aumentar credibilidad",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Idiomas",
      done: (profile.languages?.length ?? 0) >= 1,
      weight: 10,
      suggestion: "Indica los idiomas en los que ofreces sesiones",
      link: "/dashboard/professional?tab=profile",
    },
    {
      label: "Años de experiencia",
      done: profile.yearsExperience !== null && profile.yearsExperience !== undefined && profile.yearsExperience > 0,
      weight: 5,
      suggestion: "Indica tu experiencia profesional",
      link: "/dashboard/professional?tab=profile",
    },
  ], [profile]);

  const percentage = useMemo(
    () => steps.reduce((acc, s) => acc + (s.done ? s.weight : 0), 0),
    [steps]
  );

  const incomplete = steps.filter((s) => !s.done);

  if (percentage === 100) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold">
            Completa tu perfil
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Los perfiles completos reciben hasta 3x más reservas
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{percentage}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Incomplete steps (show max 3) */}
      {incomplete.length > 0 && (
        <div className="mt-4 space-y-2">
          {incomplete.slice(0, 3).map((step) => (
            <div
              key={step.label}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{step.suggestion}</span>
              </div>
              {step.link && (
                <Link
                  href={step.link}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Completar
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed count */}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        {steps.filter((s) => s.done).length} de {steps.length} pasos completados
      </div>
    </div>
  );
}
