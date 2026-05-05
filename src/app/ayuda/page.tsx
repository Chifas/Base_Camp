import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Video,
  CreditCard,
  Sparkles,
  UserCog,
  Wallet,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Centro de ayuda — GuidePath",
  description:
    "Guías paso a paso para clientes y profesionales: reservas, sesiones, suscripción Premium, pagos y cuenta.",
  alternates: { canonical: "/ayuda" },
};

const SECTIONS = [
  {
    title: "Para clientes",
    items: [
      {
        icon: CalendarCheck,
        title: "Cómo reservar tu primera sesión",
        body: "Entra en Explorar, filtra por categoría y elige un profesional. Selecciona fecha y hora desde el calendario y confirma. Si tienes créditos gratuitos disponibles, la reserva se completa al instante.",
      },
      {
        icon: Video,
        title: "Cómo unirte a la videollamada",
        body: "Recibirás un email con el enlace y también lo verás en tu panel. La sala se abre 5 minutos antes — pulsa \"Entrar a la sesión\" y permite el acceso a cámara y micrófono cuando el navegador lo pida.",
      },
      {
        icon: Sparkles,
        title: "Qué incluye Premium y cómo activarlo",
        body: "Premium da 10 sesiones al mes, reserva prioritaria, badge en tu perfil y cancelación siempre gratuita. Puedes empezar una prueba de 7 días desde la página de Precios.",
      },
      {
        icon: HelpCircle,
        title: "Cómo cancelar o reprogramar una sesión",
        body: "Desde tu panel → Sesiones → \"Cancelar\" o \"Reprogramar\". Las cancelaciones con más de 24h de antelación son gratuitas. Con Premium nunca pagas fee de cancelación.",
      },
    ],
  },
  {
    title: "Para profesionales",
    items: [
      {
        icon: UserCog,
        title: "Cómo completar tu perfil",
        body: "Tras registrarte, ve al onboarding profesional: añade tu foto, biografía, categoría, idiomas, certificaciones y disponibilidad semanal. Cuanto más completo, más visible serás en Explorar.",
      },
      {
        icon: CalendarCheck,
        title: "Cómo configurar tu disponibilidad",
        body: "En tu dashboard → Disponibilidad puedes definir bloques horarios por día de la semana y bloquear fechas concretas (vacaciones, festivos). Marca slots como \"Solo Premium\" si quieres reservarlos a clientes Premium.",
      },
      {
        icon: Wallet,
        title: "Cómo cobrar y los puntos de impacto",
        body: "Por cada sesión completada ganas 10 puntos de impacto, canjeables por certificaciones (100 pts) o donaciones benéficas (50 pts). El sistema de pagos directos llegará en una próxima fase.",
      },
    ],
  },
  {
    title: "Pagos y suscripción",
    items: [
      {
        icon: CreditCard,
        title: "Métodos de pago aceptados",
        body: "Aceptamos Visa, Mastercard y American Express a través de Stripe. Tus datos de tarjeta nunca pasan por nuestros servidores.",
      },
      {
        icon: Sparkles,
        title: "Gestionar o cancelar tu suscripción Premium",
        body: "Entra en Dashboard → Suscripción → \"Gestionar suscripción\". Te llevará al portal seguro de Stripe donde puedes actualizar tu tarjeta, descargar facturas o cancelar.",
      },
    ],
  },
  {
    title: "Cuenta y privacidad",
    items: [
      {
        icon: ShieldCheck,
        title: "Cómo borrar tu cuenta",
        body: "Escríbenos a guidepathje@gmail.com desde el email asociado a tu cuenta y procesaremos la baja en un máximo de 30 días, conforme al RGPD.",
      },
      {
        icon: ShieldCheck,
        title: "Política de privacidad y cookies",
        body: "Toda la información sobre cómo tratamos tus datos está en nuestras páginas de Privacidad y Cookies, enlazadas en el pie de página.",
      },
    ],
  },
];

export default function AyudaPage() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <header className="mt-6">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Centro de ayuda
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Encuentra respuestas a las dudas más comunes. ¿No ves la tuya?
            Escríbenos a{" "}
            <a
              href="mailto:guidepathje@gmail.com"
              className="text-primary hover:underline"
            >
              guidepathje@gmail.com
            </a>{" "}
            y te respondemos lo antes posible.
          </p>
        </header>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {section.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-stone-200 bg-white/70 p-5 backdrop-blur transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-teal-700"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                        <item.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-heading text-base font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-stone-200 bg-gradient-to-br from-teal-50 to-amber-50 p-8 text-center dark:border-stone-800 dark:from-teal-950/40 dark:to-amber-950/30">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            ¿Sigues con dudas?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Echa un vistazo a las preguntas frecuentes o escríbenos directamente.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
            >
              Ver FAQ
              <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:guidepathje@gmail.com"
              className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50 dark:hover:bg-stone-800"
            >
              Escribir a soporte
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
