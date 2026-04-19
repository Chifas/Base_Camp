"use client";

import { useRef } from "react";
import { Search, CalendarCheck, Video } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { BentoGrid } from "@/components/bento/bento-grid";
import { BentoCard } from "@/components/bento/bento-card";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Encuentra a tu profesional",
    description:
      "Explora nuestro directorio verificado. Filtra por especialidad, disponibilidad, idioma y valoraciones.",
    tone: "primary" as const,
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Reserva tu sesión",
    description:
      "Elige el horario que mejor te venga y confirma la reserva gratis al instante. Sin pagos ni compromisos.",
    tone: "violet" as const,
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4",
  },
  {
    icon: Video,
    step: "03",
    title: "Conecta por videollamada",
    description:
      "Únete a tu sesión desde la web. Sin descargas, sala integrada con chat, pantalla compartida y grabación.",
    tone: "emerald" as const,
    span: "col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", root);

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 52, scale: 0.96 });

      ScrollTrigger.batch(cards, {
        start: "top 85%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "expo.out",
            stagger: { amount: 0.35 },
          }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative border-t bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Proceso simple
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            En tres pasos, sesión reservada
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            De encontrar al profesional a conectar por videollamada en menos de 24 horas.
          </p>
        </div>

        <BentoGrid columns={12} gap="normal" className="mt-14">
          {steps.map((step) => (
            <BentoCard
              key={step.step}
              span={step.span}
              tone={step.tone}
              interactive
              noBorder
              icon={<step.icon className="h-5 w-5" />}
              eyebrow={step.step}
              title={step.title}
              description={step.description}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
