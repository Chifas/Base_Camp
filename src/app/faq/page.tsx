import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — GuidePath",
  description:
    "Respuestas a las dudas más comunes sobre cómo funciona GuidePath: reservas, pagos, suscripción Premium, cancelaciones y privacidad.",
  alternates: { canonical: "/faq" },
};

const FAQ_GROUPS = [
  {
    title: "Sobre la plataforma",
    items: [
      {
        q: "¿Qué es GuidePath?",
        a: "GuidePath es un marketplace que conecta a personas que buscan crecer profesionalmente con mentores, coaches ejecutivos, especialistas de sector y psicólogos del trabajo verificados. Las sesiones se realizan por videollamada desde la propia plataforma.",
      },
      {
        q: "¿Es gratis?",
        a: "Sí. El plan Free incluye 3 sesiones gratuitas al mes con cualquier profesional verificado. Si necesitas más sesiones o beneficios extra, puedes pasarte al plan Premium.",
      },
      {
        q: "¿Cómo se verifica a los profesionales?",
        a: "Cada profesional pasa por un proceso de verificación: revisión de titulaciones, certificaciones (ICF, colegio de psicólogos, etc.) y validación de identidad antes de aparecer en los resultados de búsqueda.",
      },
    ],
  },
  {
    title: "Reservas y sesiones",
    items: [
      {
        q: "¿Cómo reservo una sesión?",
        a: "Desde Explorar, elige un profesional, selecciona un hueco disponible en su calendario y confirma. Si tienes créditos gratuitos, la sesión se reserva al instante y recibes un email de confirmación.",
      },
      {
        q: "¿Puedo cancelar una sesión?",
        a: "Sí. Las cancelaciones con más de 24 horas de antelación son gratuitas para todos los usuarios. Las cancelaciones tardías pueden suponer un fee del 50% en plan Free. Con Premium, las cancelaciones siempre son gratis.",
      },
      {
        q: "¿Qué pasa si el profesional no aparece?",
        a: "No se descontará el crédito y te avisaremos por email para reprogramar. Si ocurre algo inesperado, escríbenos a guidepathje@gmail.com y lo resolvemos individualmente.",
      },
      {
        q: "¿Las sesiones se graban?",
        a: "No. Las videollamadas no se graban por defecto. Únicamente se podrían grabar con consentimiento expreso de ambas partes y bajo una finalidad específica acordada por escrito.",
      },
    ],
  },
  {
    title: "Suscripción Premium",
    items: [
      {
        q: "¿Qué incluye Premium?",
        a: "10 sesiones al mes (frente a 3 en Free), reserva prioritaria en horarios punta, badge Premium visible en tu perfil, cancelación siempre gratuita y soporte prioritario por email.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "19,99€ al mes o 199€ al año (equivalente a 16,58€/mes — un 17% de descuento). Incluye 7 días de prueba gratis.",
      },
      {
        q: "¿Cuándo se me cobra el primer pago?",
        a: "Al terminar los 7 días de prueba. Si cancelas antes, no se cobra nada.",
      },
      {
        q: "¿Puedo cancelar Premium cuando quiera?",
        a: "Sí, sin permanencia. Mantienes los beneficios hasta el final del periodo facturado y luego vuelves automáticamente al plan Free.",
      },
    ],
  },
  {
    title: "Pagos y facturación",
    items: [
      {
        q: "¿Qué métodos de pago aceptáis?",
        a: "Visa, Mastercard y American Express. Todos los pagos se procesan a través de Stripe, líder del sector en seguridad. Los datos de tu tarjeta nunca pasan por los servidores de GuidePath.",
      },
      {
        q: "¿Recibiré factura?",
        a: "Sí, todas las facturas están disponibles en el portal de cliente de Stripe, accesible desde tu panel: Dashboard → Suscripción → \"Gestionar suscripción\".",
      },
      {
        q: "¿Hacéis reembolsos?",
        a: "Si algo no ha ido bien, escríbenos a guidepathje@gmail.com en los 14 días posteriores al pago y revisamos cada caso individualmente.",
      },
    ],
  },
  {
    title: "Cuenta y privacidad",
    items: [
      {
        q: "¿Cómo elimino mi cuenta?",
        a: "Envíanos un email a guidepathje@gmail.com desde la dirección asociada a tu cuenta. Procesaremos la baja en un máximo de 30 días, conforme al RGPD.",
      },
      {
        q: "¿Qué datos guardáis sobre mí?",
        a: "Los necesarios para prestar el servicio: cuenta, perfil, historial de sesiones y, en el caso de profesionales, los datos de verificación. Todo el detalle está en nuestra Política de Privacidad.",
      },
      {
        q: "¿Puedo cambiar de cliente a profesional o viceversa?",
        a: "Sí. Desde tu perfil puedes solicitar el cambio de rol. Si pasas a profesional, te pediremos completar el proceso de onboarding y verificación.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mt-6 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Preguntas frecuentes
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Todo lo que necesitas saber para sacarle partido a GuidePath.
          </p>
        </header>

        <div className="mt-12 space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-4 font-heading text-lg font-semibold tracking-tight">
                {group.title}
              </h2>
              <dl className="space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur transition-colors open:border-teal-300 open:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:open:border-teal-700 dark:open:bg-stone-900"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-semibold text-stone-900 dark:text-stone-50">
                      {item.q}
                      <span className="text-teal-600 transition-transform group-open:rotate-45 dark:text-teal-400">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {item.a}
                    </p>
                  </details>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          <p>
            ¿No encuentras lo que buscas? Escríbenos a{" "}
            <a
              href="mailto:guidepathje@gmail.com"
              className="text-primary hover:underline"
            >
              guidepathje@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
