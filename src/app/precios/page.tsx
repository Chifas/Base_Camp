import type { Metadata } from "next";
import { PricingCards } from "./pricing-cards";
import { PREMIUM_PRICING, TIER_LIMITS } from "@/lib/credits-config";

export const metadata: Metadata = {
  title: "Precios — GuidePath Premium",
  description:
    "Empieza gratis con 3 sesiones al mes o pásate a Premium por 19,99€/mes con 10 sesiones, reserva prioritaria y cancelación gratuita. 7 días de prueba gratis.",
  alternates: { canonical: "/precios" },
};

const FAQ = [
  {
    q: "¿Cuándo se me cobra?",
    a: `Solo después de los ${PREMIUM_PRICING.trialDays} días de prueba. Puedes cancelar antes y no se cobrará nada.`,
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancela desde el portal de gestión sin penalizaciones. Mantienes Premium hasta el final del periodo facturado.",
  },
  {
    q: "¿Qué pasa si mi tarjeta falla?",
    a: "Te avisaremos por email para que la actualices. Mantenemos tu acceso unos días en gracia y luego volvemos automáticamente al plan Free.",
  },
  {
    q: "¿Hay reembolsos?",
    a: "Si algo va mal, escríbenos a guidepathje@gmail.com en los primeros 14 días y resolvemos el caso individualmente.",
  },
];

export default function PreciosPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Aurora background — matches landing style */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-teal-300/30 blur-3xl dark:bg-teal-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-500/10"
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pt-20 pb-10 text-center sm:px-6 sm:pt-28 lg:px-8">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
          ✦ Empieza con 7 días gratis
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl lg:text-6xl">
          Elige el plan que te lleva más lejos
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600 dark:text-stone-400 sm:text-xl">
          Free para probar, Premium para escalar. Sin permanencia, sin sorpresas.
          Cancelas cuando quieras desde tu panel.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="relative mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <PricingCards
          freeLimits={TIER_LIMITS.FREE}
          premiumLimits={TIER_LIMITS.PREMIUM}
          monthlyAmount={PREMIUM_PRICING.monthlyAmount}
          yearlyAmount={PREMIUM_PRICING.yearlyAmount}
          yearlyDiscountPercent={PREMIUM_PRICING.yearlyDiscountPercent}
          trialDays={PREMIUM_PRICING.trialDays}
        />
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur transition-colors open:border-teal-300 open:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:open:border-teal-700 dark:open:bg-stone-900"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-stone-900 dark:text-stone-50">
                {item.q}
                <span className="text-teal-600 transition-transform group-open:rotate-45 dark:text-teal-400">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {item.a}
              </p>
            </details>
          ))}
        </dl>
      </section>
    </main>
  );
}
