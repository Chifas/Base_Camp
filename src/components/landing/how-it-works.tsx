"use client";

import { useRef } from "react";
import { Search, CalendarCheck, Video } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Encuentra a tu profesional",
    description: "Explora nuestro directorio de profesionales verificados. Filtra por especialidad, disponibilidad y valoraciones.",
    accent: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    glow: "shadow-blue-500/20",
    activeBorder: "border-blue-500/40",
  },
  {
    icon: CalendarCheck,
    step: "2",
    title: "Reserva tu sesión",
    description: "Elige el horario que mejor te venga y confirma tu reserva gratuita al instante. Sin pagos, sin compromisos.",
    accent: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    glow: "shadow-violet-500/20",
    activeBorder: "border-violet-500/40",
  },
  {
    icon: Video,
    step: "3",
    title: "Conecta por videollamada",
    description: "Únete a tu sesión desde cualquier dispositivo. Sin descargas, sin salir de la plataforma. Tu espacio seguro.",
    accent: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    glow: "shadow-emerald-500/20",
    activeBorder: "border-emerald-500/40",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
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

    // Responsive: desktop = pinned scrub, mobile = stagger
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Initial state: cards dimmed
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

      // Progress line fills across all 3 steps
      tl.to(lineRef.current, { scaleX: 1, duration: 3, ease: "none" }, 0);

      // Each card activates in sequence
      cards.forEach((card, i) => {
        tl.to(
          card,
          { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
          i * 0.8
        );
      });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(cards, { opacity: 0, y: 50 });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(lineRef.current, {
        scaleX: 1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: contentRef.current, start: "top 78%", once: true },
      });

      cards.forEach((card, i) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "expo.out",
          delay: i * 0.15,
          scrollTrigger: { trigger: card, start: "top 84%", once: true },
        });
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="border-t bg-muted/30 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
            Proceso simple
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            En tres sencillos pasos estarás conectado con el profesional que necesitas.
          </p>
        </FadeIn>

        <div ref={contentRef} className="relative mt-16">
          {/* Animated connector line — desktop */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px bg-border/50 overflow-hidden">
            <div
              ref={lineRef}
              className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500"
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
                <div className="relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  {/* Gradient accent top */}
                  <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${step.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                  {/* Inset glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ boxShadow: "inset 0 0 50px rgba(99,102,241,0.06)" }} />

                  {/* Step number */}
                  <span className="font-heading text-7xl font-bold text-foreground/6 absolute right-3 top-0 select-none leading-none">
                    {step.step}
                  </span>

                  {/* Icon */}
                  <div data-step-icon>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} ${step.text} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${step.glow}`}>
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>

                  <h3 className="mt-6 font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{step.description}</p>

                  {/* Step dots indicator */}
                  <div className="mt-6 flex items-center gap-1.5">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === index
                            ? `w-6 bg-gradient-to-r ${step.accent}`
                            : "w-1.5 bg-muted-foreground/20"
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
