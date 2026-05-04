"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap-config";

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const box = boxRef.current;
      if (!box) return;

      // Clip-path wipe reveal — no opacity hiding so content is always visible
      gsap.set(box, { clipPath: "inset(0 0 100% 0 round 24px)" });

      const headline = box.querySelector<HTMLElement>("[data-cta-headline]");
      const sub      = box.querySelector<HTMLElement>("[data-cta-sub]");
      const btns     = box.querySelector<HTMLElement>("[data-cta-btns]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: box, start: "top 82%", once: true },
      });

      tl.to(box, {
          clipPath: "inset(0 0 0% 0 round 24px)",
          duration: 0.9,
          ease: "expo.out",
        })
        .fromTo(headline, { y: 24 }, { y: 0, duration: 0.65, ease: "power3.out" }, "-=0.4")
        .fromTo(sub,      { y: 16 }, { y: 0, duration: 0.55, ease: "power3.out" }, "-=0.35")
        .fromTo(btns,     { y: 12 }, { y: 0, duration: 0.5,  ease: "power3.out" }, "-=0.3");
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={boxRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 px-8 py-16 text-center shadow-xl shadow-teal-700/20 sm:px-16 sm:py-24"
        >
          {/* Aurora highlights */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"
          />
          {/* Soft pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#ffffff14_1px,transparent_1px)] [background-size:28px_28px] opacity-60"
          />
          <div className="relative">
          <h2
            data-cta-headline
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            ¿Listo para dar el siguiente
            <br className="hidden sm:block" /> paso en tu carrera?
          </h2>

          <p
            data-cta-sub
            className="mx-auto mt-5 max-w-xl text-lg text-white/80 leading-relaxed"
          >
            Conecta con el mentor o coach que necesitas. Reserva tu primera sesión hoy
            y empieza a construir la carrera que mereces.
          </p>

          <div
            data-cta-btns
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="group w-full sm:w-auto rounded-full !bg-white !text-teal-700 hover:!bg-white/90 shadow-lg h-12 px-8 text-base font-display font-semibold transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link href="/auth/register">
                Empezar gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full !border-white/40 !text-white !bg-white/10 hover:!bg-white/20 hover:!border-white/60 h-12 px-8 text-base font-display font-medium"
              asChild
            >
              <Link href="/explore">Explorar profesionales</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-teal-200/90">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
          </div>
        </div>
      </div>
    </section>
  );
}
