"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const steps = [
  {
    step: "01",
    title: "Encuentra a tu profesional",
    description:
      "Explora nuestro directorio de expertos verificados. Filtra por especialidad, disponibilidad y valoraciones.",
  },
  {
    step: "02",
    title: "Reserva tu sesión",
    description:
      "Elige el horario que mejor te venga y confirma tu reserva gratuita al instante. Sin pagos, sin compromisos.",
  },
  {
    step: "03",
    title: "Conecta por videollamada",
    description:
      "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma. Tu espacio seguro.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-step-card]", sectionRef.current!);

      gsap.set(cards, { y: 30 });

      ScrollTrigger.batch(cards, {
        start: "top 86%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.15,
          });
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="border-t bg-stone-50/50 dark:bg-stone-900/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-display font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
            Proceso simple
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-stone-900 dark:text-stone-50">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
            En tres sencillos pasos estarás conectado con el profesional que necesitas.
          </p>
        </FadeIn>

        <div className="relative mt-16">
          {/* Dashed connector — desktop */}
          <div className="hidden md:block absolute top-[44px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] border-t-2 border-dashed border-stone-300 dark:border-stone-600" />

          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <div key={step.step} data-step-card className="relative">
                {/* Step number circle */}
                <div className="relative z-10 flex h-[88px] w-[88px] items-center justify-center">
                  {/* Large decorative bg number */}
                  <span className="absolute font-display text-8xl font-bold text-teal-700/[0.07] dark:text-teal-400/[0.07] select-none leading-none">
                    {step.step}
                  </span>
                  {/* Visible step circle */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-stone-200 dark:border-stone-700 dark:bg-stone-900 shadow-sm">
                    <span className="font-display text-sm font-bold text-teal-700 dark:text-teal-400">
                      {step.step}
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
                  {step.title}
                </h3>
                <p className="mt-3 text-stone-600 dark:text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
