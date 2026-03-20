"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, Video, ChevronRight } from "lucide-react";
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
      "Explora nuestro directorio de profesionales verificados. Filtra por especialidad, disponibilidad y valoraciones.",
    accent: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  {
    icon: CalendarCheck,
    step: "02",
    title: "Reserva tu sesión",
    description:
      "Elige el horario que mejor te venga y confirma tu reserva gratuita al instante. Sin pagos, sin compromisos.",
    accent: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
  },
  {
    icon: Video,
    step: "03",
    title: "Conecta por videollamada",
    description:
      "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma. Tu espacio seguro.",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
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
          <StaggerContainer
            className="grid gap-6 md:grid-cols-3 md:gap-14"
            delay={0.2}
          >
            {steps.map((step, index) => (
              <StaggerItem key={step.step} className="h-full">
                <div className="group relative h-full">
                  {/* Connector arrow — desktop only */}
                  {index < steps.length - 1 && (
                    <div className="pointer-events-none absolute -right-[48px] top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.2, duration: 0.4 }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-background/80 backdrop-blur-sm shadow-sm">
                          <ChevronRight className="h-5 w-5 text-primary" />
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-glow h-full">
                    {/* Top gradient accent line */}
                    <div
                      className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${step.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                    />

                    {/* Step number */}
                    <span className="font-heading text-5xl font-bold text-muted-foreground/10 absolute right-4 top-2 select-none">
                      {step.step}
                    </span>

                    {/* Floating icon */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} ${step.text} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
                      >
                        <step.icon className="h-7 w-7" />
                      </div>
                    </motion.div>

                    <h3 className="mt-6 font-heading text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
