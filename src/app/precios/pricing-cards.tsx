"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TierLimits {
  sessionsPerMonth: number;
  maxFreePerProfessional: number;
  cancellationFreeBefore: number;
  priorityBooking: boolean;
  badge: boolean;
}

interface PricingCardsProps {
  freeLimits: TierLimits;
  premiumLimits: TierLimits;
  monthlyAmount: number;
  yearlyAmount: number;
  yearlyDiscountPercent: number;
  trialDays: number;
}

type Interval = "month" | "year";

export function PricingCards({
  freeLimits,
  premiumLimits,
  monthlyAmount,
  yearlyAmount,
  yearlyDiscountPercent,
  trialDays,
}: PricingCardsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("month");
  const [loading, setLoading] = useState(false);

  const isAuthed = status === "authenticated";
  const currentTier = session?.user?.subscriptionTier ?? "FREE";
  const isPremium = currentTier === "PREMIUM" || currentTier === "ENTERPRISE";

  const monthlyDisplay = monthlyAmount.toFixed(2).replace(".", ",");
  const yearlyDisplay = yearlyAmount.toFixed(0);
  const yearlyMonthly = (yearlyAmount / 12).toFixed(2).replace(".", ",");

  async function handleStartTrial() {
    if (!isAuthed) {
      router.push(`/auth/register?next=/precios&plan=premium-${interval}`);
      return;
    }
    if (isPremium) {
      router.push("/dashboard/client?tab=subscription");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        toast.error(data.error || "No se pudo iniciar el pago");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const freeFeatures: string[] = [
    `${freeLimits.sessionsPerMonth} sesiones gratis al mes`,
    `${freeLimits.maxFreePerProfessional} sesión gratuita por profesional`,
    `Cancelación gratis hasta ${freeLimits.cancellationFreeBefore}h antes`,
    "Videollamadas integradas",
    "Acceso a todos los profesionales verificados",
  ];

  const premiumFeatures: string[] = [
    `${premiumLimits.sessionsPerMonth} sesiones al mes`,
    `Hasta ${premiumLimits.maxFreePerProfessional} sesiones por profesional`,
    "Cancelación siempre gratis (sin fee 24h)",
    "Reserva prioritaria en horarios peak",
    "Badge Premium visible en tu perfil",
    "Soporte prioritario por email",
  ];

  return (
    <>
      {/* Interval toggle */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <button
            onClick={() => setInterval("month")}
            aria-pressed={interval === "month"}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
              interval === "month"
                ? "bg-teal-600 text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setInterval("year")}
            aria-pressed={interval === "year"}
            className={cn(
              "relative rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
              interval === "year"
                ? "bg-teal-600 text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100",
            )}
          >
            Anual
            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              −{yearlyDiscountPercent}%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FREE card */}
        <div className="relative rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">Free</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Ideal para empezar y probar la plataforma
          </p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
              0€
            </span>
            <span className="text-sm text-stone-500 dark:text-stone-400">para siempre</span>
          </div>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                {f}
              </li>
            ))}
          </ul>
          {!isPremium && (
            <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-500">
              Tu plan actual
            </p>
          )}
        </div>

        {/* PREMIUM card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-8 shadow-xl shadow-teal-700/10 dark:border-teal-400 dark:from-teal-950/40 dark:via-stone-900 dark:to-amber-950/30">
          {/* Aurora accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/15"
          />
          <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-600 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow">
            <Sparkles className="h-3 w-3" />
            Más popular
          </span>
          <div className="relative">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">Premium</h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Para quien quiere acelerar de verdad su crecimiento
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              {interval === "month" ? (
                <>
                  <span className="font-display text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
                    {monthlyDisplay}€
                  </span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">/ mes</span>
                </>
              ) : (
                <>
                  <span className="font-display text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
                    {yearlyDisplay}€
                  </span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">/ año</span>
                </>
              )}
            </div>
            {interval === "year" && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Equivale a {yearlyMonthly}€/mes — facturado una vez al año
              </p>
            )}
            <ul className="mt-6 space-y-3">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-stone-800 dark:text-stone-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={handleStartTrial}
              disabled={loading}
              size="lg"
              className="mt-8 h-12 w-full bg-teal-700 text-base font-display font-semibold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPremium ? (
                "Gestionar suscripción"
              ) : (
                `Empezar prueba de ${trialDays} días`
              )}
            </Button>
            {!isPremium && (
              <p className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400">
                Sin compromiso. Cancela cuando quieras.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
