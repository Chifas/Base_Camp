"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, Video } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion-wrapper";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Encuentra a tu profesional",
    description:
      "Explora nuestro directorio de profesionales verificados. Filtra por especialidad, precio, disponibilidad y valoraciones.",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Reserva tu sesión",
    description:
      "Elige el horario que mejor te venga y realiza el pago de forma segura. Recibirás la confirmación al instante.",
  },
  {
    icon: Video,
    step: "03",
    title: "Conecta por videollamada",
    description:
      "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma. Tu espacio seguro.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-t bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Proceso simple
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En tres sencillos pasos estarás conectado con el profesional que
            necesitas.
          </p>
        </FadeIn>

        <div className="relative mt-16">
          {/* Connection lines between cards (desktop only) */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <motion.div
              className="absolute left-[33.3%] top-[80px] h-[2px] w-[calc(33.3%-2rem)] bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.div
              className="absolute left-[66.6%] top-[80px] h-[2px] w-[calc(33.3%-2rem)] bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </div>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-3"
            delay={0.2}
          >
            {steps.map((step, index) => (
              <StaggerItem key={step.step}>
                <div className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-glow">
                  {/* Step number */}
                  <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {step.step}
                  </span>

                  {/* Floating icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <step.icon className="h-6 w-6" />
                    </div>
                  </motion.div>

                  <h3 className="mt-6 font-heading text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
