"use client";

import { useRef } from "react";
import Link from "next/link";
import { Heart, Award, Sparkles, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { CREDITS_CONFIG, TIER_LIMITS, PREMIUM_PRICING } from "@/lib/credits-config";

const FLOW = [
  {
    icon: Heart,
    label: "Tú reservas",
    title: `${CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH} sesiones gratis al mes`,
    description:
      "Sin tarjeta de crédito, sin compromiso. Reserva, asiste y avanza en tu carrera.",
    accent: "from-teal-500 to-teal-700",
    iconBg: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    icon: Sparkles,
    label: "El profesional gana",
    title: `+${CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION} puntos de impacto por sesión`,
    description:
      "Cada sesión completada se traduce en puntos. Construyen reputación, visibilidad y recompensas.",
    accent: "from-amber-500 to-amber-700",
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    icon: Award,
    label: "Los puntos se canjean",
    title: "Certificaciones o donaciones solidarias",
    description: `${CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION} pts → certificación profesional · ${CREDITS_CONFIG.IMPACT_POINTS_DONATION} pts → donación a causas sociales.`,
    accent: "from-stone-700 to-stone-900",
    iconBg: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  },
];

const FREE = TIER_LIMITS.FREE;
const PREMIUM = TIER_LIMITS.PREMIUM;

const COMPARISON: Array<{ feature: string; free: boolean | string; premium: boolean | string }> = [
  { feature: "Sesiones por mes", free: `${FREE.sessionsPerMonth}`, premium: `${PREMIUM.sessionsPerMonth}` },
  { feature: "Sesiones con un mismo profesional/mes", free: `${FREE.maxFreePerProfessional}`, premium: `${PREMIUM.maxFreePerProfessional}` },
  { feature: "Cancelación gratuita", free: `${FREE.cancellationFreeBefore}h antes`, premium: "Siempre" },
  { feature: "Reserva en horarios prioritarios", free: false, premium: true },
  { feature: "Acceso a expertos verificados", free: true, premium: true },
  { feature: "Sin tarjeta de crédito", free: true, premium: false },
];

export function FreemiumModel() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-flow-card]",
        sectionRef.current!
      );
      gsap.set(cards, { y: 30 });
      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, { y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 });
        },
      });

      const compare = sectionRef.current!.querySelector<HTMLElement>("[data-compare]");
      if (compare) {
        gsap.set(compare, { y: 24 });
        ScrollTrigger.create({
          trigger: compare,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(compare, { y: 0, duration: 0.7, ease: "power3.out" });
          },
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="modelo-gratuito"
      aria-labelledby="modelo-gratuito-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-white py-20 dark:border-stone-800/60 dark:bg-stone-950 sm:py-28"
    >
      {/* Soft accent blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl dark:bg-teal-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl dark:bg-amber-500/5"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Modelo gratuito
          </p>
          <h2
            id="modelo-gratuito-title"
            className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl"
          >
            Por qué nadie tiene que pagar para empezar
          </h2>
          <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
            GuidePath funciona como un círculo virtuoso: tú avanzas, el profesional crece,
            y la comunidad recibe.
          </p>
        </div>

        {/* 3 columns flow */}
        <div className="relative mt-14">
          {/* Connector line — desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-9 hidden border-t-2 border-dashed border-stone-300 dark:border-stone-700 md:block"
          />

          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {FLOW.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  data-flow-card
                  className="relative rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
                >
                  <div
                    className={`relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl ${step.iconBg}`}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-stone-700 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700">
                      {i + 1}
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-display font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {step.label}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-stone-700 dark:text-stone-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Free vs Premium */}
        <div data-compare className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
              ¿Necesitas más? Compara los planes
            </h3>
            <p className="mt-3 text-stone-700 dark:text-stone-300">
              Empieza siempre gratis. Si quieres más sesiones o flexibilidad,
              tienes Premium con {PREMIUM_PRICING.trialDays} días de prueba.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* Free card */}
            <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                    Para empezar
                  </p>
                  <h4 className="mt-1 font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
                    Gratis
                  </h4>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-extrabold text-stone-900 dark:text-stone-50">
                    0€
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">para siempre</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {COMPARISON.map((row) => (
                  <li
                    key={`free-${row.feature}`}
                    className="flex items-center gap-3 text-sm text-stone-800 dark:text-stone-200"
                  >
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <Check className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-600" aria-hidden="true" />
                      )
                    ) : (
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        ✓
                      </span>
                    )}
                    <span>
                      <span className="font-medium">{row.feature}</span>
                      {typeof row.free !== "boolean" && (
                        <span className="ml-2 text-stone-600 dark:text-stone-400">{row.free}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-7 w-full bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
                asChild
              >
                <Link href="/auth/register">
                  Empezar gratis
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Premium card */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-teal-600 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-8 shadow-md dark:border-teal-500 dark:from-teal-950/40 dark:via-stone-900 dark:to-amber-950/30">
              <span className="absolute right-6 top-6 rounded-full bg-teal-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                Recomendado
              </span>

              <div>
                <p className="text-xs font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300">
                  Para los que van en serio
                </p>
                <h4 className="mt-1 font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
                  Premium
                </h4>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <p className="font-display text-4xl font-extrabold text-stone-900 dark:text-stone-50">
                  {PREMIUM_PRICING.monthlyAmount}€
                </p>
                <p className="pb-1 text-sm text-stone-600 dark:text-stone-400">/ mes</p>
              </div>
              <p className="mt-1 text-xs text-teal-700 dark:text-teal-300">
                {PREMIUM_PRICING.trialDays} días gratis · cancela cuando quieras
              </p>

              <ul className="mt-6 space-y-3">
                {COMPARISON.map((row) => (
                  <li
                    key={`premium-${row.feature}`}
                    className="flex items-center gap-3 text-sm text-stone-800 dark:text-stone-200"
                  >
                    {typeof row.premium === "boolean" ? (
                      row.premium ? (
                        <Check className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" aria-hidden="true" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-600" aria-hidden="true" />
                      )
                    ) : (
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white dark:bg-teal-500">
                        ✓
                      </span>
                    )}
                    <span>
                      <span className="font-medium">{row.feature}</span>
                      {typeof row.premium !== "boolean" && (
                        <span className="ml-2 text-stone-600 dark:text-stone-400">{row.premium}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-7 w-full bg-teal-700 text-white hover:bg-teal-800"
                asChild
              >
                <Link href="/precios">
                  Ver Premium
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
