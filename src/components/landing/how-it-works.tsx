"use client";

import { useRef } from "react";
import { Search, CalendarCheck, Video } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Encuentra a tu profesional",
    description: "Explora nuestro directorio de profesionales verificados. Filtra por especialidad, disponibilidad y valoraciones.",
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    numberColor: "text-teal-600/8",
    accentBar: "bg-teal-600",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Reserva tu sesión",
    description: "Elige el horario que mejor te venga y confirma tu reserva gratuita al instante. Sin pagos, sin compromisos.",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    numberColor: "text-amber-600/8",
    accentBar: "bg-amber-500",
  },
  {
    icon: Video,
    step: "03",
    title: "Conecta por videollamada",
    description: "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma. Tu espacio seguro.",
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-700 dark:text-teal-300",
    numberColor: "text-teal-700/8",
    accentBar: "bg-teal-700",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = gsap.utils.toArray<HTMLElement>("[data-step-card]", sectionRef.current!);
    const icons = gsap.utils.toArray<HTMLElement>("[data-step-icon]", sectionRef.current!);

    // Icons float
    icons.forEach((icon, i) => {
      gsap.to(icon, {
        y: -10,
        duration: 2.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.7,
      });
    });

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.set(cards, { opacity: 0.25, scale: 0.95, y: 0 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1400",
          pin: true,
          scrub: 1.2,
          pinSpacing: true,
        },
      });

      tl.to(lineRef.current, { scaleX: 1, duration: 3, ease: "none" }, 0);
      cards.forEach((card, i) => {
        tl.to(card, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, i * 0.8);
      });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(cards, { opacity: 0, y: 30 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(lineRef.current, {
        scaleX: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: contentRef.current, start: "top 78%", once: true },
      });

      cards.forEach((card, i) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.15,
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="border-t bg-warm-surface/50 dark:bg-stone-900/30 py-20 sm:py-28"
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

        <div ref={contentRef} className="relative mt-16">
          {/* Animated connector line — desktop */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              ref={lineRef}
              className="absolute inset-0 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-600"
              style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <div
                key={step.step}
                data-step-card
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  {/* Top accent bar */}
                  <div className={`absolute left-0 top-0 h-1 w-0 ${step.accentBar} transition-all duration-500 group-hover:w-full rounded-t-2xl`} />

                  {/* Step number — large background decoration */}
                  <span className={`font-display text-7xl font-bold ${step.numberColor} absolute right-4 top-2 select-none leading-none`}>
                    {step.step}
                  </span>

                  {/* Icon */}
                  <div data-step-icon>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconBg} ${step.iconColor} transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-semibold text-stone-900 dark:text-stone-50">{step.title}</h3>
                  <p className="mt-3 text-stone-600 dark:text-stone-400 leading-relaxed">{step.description}</p>

                  {/* Step dots */}
                  <div className="mt-6 flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === index
                            ? `w-6 ${step.accentBar}`
                            : "w-1.5 bg-stone-200 dark:bg-stone-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
