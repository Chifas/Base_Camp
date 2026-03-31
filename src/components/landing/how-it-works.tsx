"use client";

import { Search, CalendarCheck, Video } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Encuentra a tu profesional",
    description:
      "Explora nuestro directorio de profesionales verificados. Filtra por especialidad, disponibilidad y valoraciones.",
  },
  {
    icon: CalendarCheck,
    step: "2",
    title: "Reserva tu sesión",
    description:
      "Elige el horario que mejor te venga y confirma tu reserva gratuita al instante. Sin pagos, sin compromisos.",
  },
  {
    icon: Video,
    step: "3",
    title: "Conecta por videollamada",
    description:
      "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En tres pasos estarás conectado con el profesional que necesitas.
          </p>
        </FadeIn>

        <StaggerContainer
          className="mt-14 grid gap-8 md:grid-cols-3"
          delay={0.1}
        >
          {steps.map((step) => (
            <StaggerItem key={step.step}>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-primary">
                  Paso {step.step}
                </span>
                <h3 className="mt-2 font-heading text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
