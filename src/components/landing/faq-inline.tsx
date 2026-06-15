"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/shared/motion-wrapper";

const FAQ = [
  {
    q: "¿Es realmente gratis o hay letra pequeña?",
    a: "Sí, es 100% gratis para los clientes. Tienes 3 sesiones cada mes natural sin tarjeta de crédito ni compromiso. El modelo se sostiene porque los profesionales ganan puntos de impacto canjeables por certificaciones o donaciones solidarias — no por dinero. Solo hay un plan Premium opcional si quieres más sesiones al mes.",
  },
  {
    q: "¿Cómo verificáis a los profesionales?",
    a: "Cada profesional pasa por verificación de identidad (DNI o pasaporte), revisión de titulación o certificación profesional, comprobación de su trayectoria pública (LinkedIn, registro de psicólogos, ICF, etc.) y entrevista con nuestro equipo. Solo el ~30% de quienes solicitan unirse acaban siendo aprobados.",
  },
  {
    q: "¿Qué pasa si no encajo con el profesional?",
    a: "Sin problema. Puedes reservar con otro profesional inmediatamente — el contador de sesiones gratuitas es por mes, no por profesional. Además, si dejas una reseña honesta nos ayuda a mejorar las recomendaciones para futuros usuarios.",
  },
  {
    q: "¿Cómo es la videollamada? ¿Hace falta instalar algo?",
    a: "No hace falta instalar nada. La videollamada ocurre dentro de nuestra plataforma (basada en Daily.co, el mismo proveedor que usan empresas como Webflow o Instabase). Funciona en navegador desde cualquier ordenador o móvil y soporta compartir pantalla y chat en directo.",
  },
  {
    q: "¿Puedo cancelar o reprogramar una sesión?",
    a: "Sí. Puedes cancelar gratis hasta 24 horas antes (para usuarios Free) o en cualquier momento (Premium). Para reprogramar, abre la sesión desde tu panel y propone otro horario — el profesional recibe una notificación y confirma o sugiere otra opción.",
  },
  {
    q: "¿Es confidencial lo que comparto en una sesión?",
    a: "Sí. Todas las sesiones son confidenciales entre tú y tu profesional. GuidePath no graba ni almacena el contenido de las videollamadas. Las notas que el profesional comparte contigo solo las ves tú. Los psicólogos están sujetos al código deontológico de su colegio profesional.",
  },
];

export function FaqInline() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="faq-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-stone-50 py-20 dark:border-stone-800/60 dark:bg-stone-900/40 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Preguntas frecuentes
          </p>
          <h2 id="faq-title" className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            Resolvemos tus dudas
          </h2>
          <p className="mt-3 text-base text-stone-700 dark:text-stone-300">
            Si tienes una pregunta más específica, escríbenos por chat o consulta el centro de ayuda.
          </p>
        </FadeIn>

        <div className="mt-10 space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={item.q}
              className={`overflow-hidden rounded-xl border bg-white transition-colors dark:bg-stone-900 ${
                open === i
                  ? "border-teal-400 shadow-sm dark:border-teal-700"
                  : "border-stone-200 dark:border-stone-800"
              }`}
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-display font-semibold text-stone-900 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset dark:text-stone-50 dark:hover:bg-stone-800/50"
                >
                  {item.q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-300 ${
                      open === i ? "rotate-180 text-teal-600 dark:text-teal-400" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={`faq-${i}`}
                className={`grid transition-all duration-300 ease-out ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-display font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
          >
            Ver todas las preguntas frecuentes →
          </Link>
        </div>
      </div>
    </section>
  );
}
