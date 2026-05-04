"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  reason?: "credits_exhausted" | "late_cancellation" | "generic";
}

const REASON_COPY: Record<NonNullable<UpgradePromptProps["reason"]>, { title: string; sub: string }> = {
  credits_exhausted: {
    title: "Has usado tus 3 sesiones gratuitas",
    sub: "Pásate a Premium para 7 sesiones extra al mes y reserva prioritaria.",
  },
  late_cancellation: {
    title: "Cancelación con fee del 50%",
    sub: "Con Premium cancelas siempre gratis, sin importar cuándo.",
  },
  generic: {
    title: "Acelera tu progreso con Premium",
    sub: "Más sesiones, reserva prioritaria y cancelación libre. Empieza con 7 días gratis.",
  },
};

const BENEFITS = [
  "10 sesiones al mes (vs 3)",
  "Cancelación siempre gratis",
  "Reserva prioritaria en horarios peak",
  "Badge Premium visible",
];

export function UpgradePrompt({ open, onClose, reason = "generic" }: UpgradePromptProps) {
  const [loading, setLoading] = useState(false);

  async function handleStart(interval: "month" | "year") {
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

  const copy = REASON_COPY[reason];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 sm:rounded-3xl"
          >
            {/* Aurora */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/15"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-500/15"
            />

            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 dark:bg-stone-800 dark:hover:bg-stone-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-7 sm:p-9">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-600 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow">
                <Sparkles className="h-3 w-3" />
                Premium
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-stone-900 dark:text-stone-50 sm:text-3xl">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 sm:text-base">
                {copy.sub}
              </p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {BENEFITS.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-stone-800 dark:text-stone-200"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => handleStart("month")}
                  disabled={loading}
                  size="lg"
                  className="flex-1 bg-teal-700 text-white hover:bg-teal-800"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Probar 7 días — 19,99€/mes"}
                </Button>
                <Button
                  onClick={() => handleStart("year")}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Anual − 17%
                </Button>
              </div>
              <p className="mt-3 text-center text-xs text-stone-500 dark:text-stone-400">
                Sin compromiso. Cancela cuando quieras.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
