"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, ArrowRight, ExternalLink, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/shared/premium-badge";
import { toast } from "sonner";

interface SubscriptionState {
  tier: "FREE" | "PREMIUM" | "ENTERPRISE";
  status: string | null;
  endsAt: string | null;
  interval: string | null;
  hasActiveSubscription: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "text-emerald-600 dark:text-emerald-400" },
  trialing: { label: "En prueba gratuita", color: "text-teal-600 dark:text-teal-400" },
  past_due: { label: "Pago pendiente", color: "text-amber-600 dark:text-amber-400" },
  canceled: { label: "Cancelada", color: "text-stone-500 dark:text-stone-400" },
  incomplete: { label: "Incompleta", color: "text-amber-600 dark:text-amber-400" },
};

function formatEndsAt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SubscriptionTab() {
  const router = useRouter();
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((res) => res.json())
      .then((data) => {
        if (data.tier) setState(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleStartCheckout(interval: "month" | "year") {
    setActionLoading(true);
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
      setActionLoading(false);
    }
  }

  async function handleOpenPortal() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.portalUrl) {
        toast.error(data.error || "No se pudo abrir el portal");
        return;
      }
      window.location.href = data.portalUrl;
    } catch {
      toast.error("Error de conexión");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!state) {
    return (
      <p className="text-sm text-stone-500 dark:text-stone-400">
        No se pudo cargar tu suscripción.
      </p>
    );
  }

  const isPremium = state.tier === "PREMIUM" || state.tier === "ENTERPRISE";
  const statusInfo = state.status ? STATUS_LABELS[state.status] : null;

  if (!isPremium) {
    return (
      <div className="space-y-6">
        {/* Free state header */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Plan actual
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
                Free
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                3 sesiones gratuitas al mes · cancelación gratis &gt;24h
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/precios">
                Ver planes <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Upsell card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-7 shadow-xl shadow-teal-700/10 dark:border-teal-400 dark:from-teal-950/40 dark:via-stone-900 dark:to-amber-950/30">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/15"
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                Pásate a Premium
              </h3>
            </div>
            <p className="mt-2 text-sm text-stone-700 dark:text-stone-300">
              Más sesiones, reserva prioritaria y cancelación siempre gratis. Empieza con 7 días de prueba — sin cargo si cancelas a tiempo.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "10 sesiones al mes",
                "Cancelación siempre gratis",
                "Reserva prioritaria",
                "Badge Premium visible",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-stone-800 dark:text-stone-200"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => handleStartCheckout("month")}
                disabled={actionLoading}
                size="lg"
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Probar 7 días — 19,99€/mes"
                )}
              </Button>
              <Button
                onClick={() => handleStartCheckout("year")}
                disabled={actionLoading}
                variant="outline"
                size="lg"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Plan anual — 199€ (−17%)"
                )}
              </Button>
            </div>
            <button
              onClick={() => router.push("/precios")}
              className="mt-4 text-xs font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
            >
              Ver detalles y comparativa →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium state
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-6 shadow-sm dark:border-teal-400 dark:from-teal-950/40 dark:via-stone-900 dark:to-amber-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Plan actual
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
                Premium
              </p>
              <PremiumBadge size="md" />
            </div>
            {statusInfo && (
              <p className={`mt-1 text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-stone-200 pt-6 dark:border-stone-800 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {state.status === "canceled" ? "Acceso hasta" : "Próxima renovación"}
            </p>
            <p className="mt-1 font-display text-base font-semibold text-stone-900 dark:text-stone-50">
              {formatEndsAt(state.endsAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Facturación
            </p>
            <p className="mt-1 font-display text-base font-semibold text-stone-900 dark:text-stone-50">
              {state.interval === "year" ? "Anual" : state.interval === "month" ? "Mensual" : "—"}
            </p>
          </div>
        </div>

        {state.status === "past_due" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Hubo un problema con tu último pago. Actualiza tu tarjeta para no perder Premium.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleOpenPortal}
            disabled={actionLoading}
            className="bg-teal-700 text-white hover:bg-teal-800"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Gestionar suscripción <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          Desde el portal puedes cambiar de tarjeta, ver facturas o cancelar.
        </p>
      </div>
    </div>
  );
}
