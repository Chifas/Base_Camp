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

      gsap.set(box, { clipPath: "inset(0 0 100% 0 round 24px)", opacity: 0 });

      const headline = box.querySelector<HTMLElement>("[data-cta-headline]");
      const sub      = box.querySelector<HTMLElement>("[data-cta-sub]");
      const btns     = box.querySelector<HTMLElement>("[data-cta-btns]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: box, start: "top 82%", once: true },
      });

      tl.to(box, {
          clipPath: "inset(0 0 0% 0 round 24px)",
          opacity: 1,
          duration: 0.9,
          ease: "expo.out",
        })
        .fromTo(headline, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, "-=0.4")
        .fromTo(sub,      { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.35")
        .fromTo(btns,     { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5,  ease: "power3.out" }, "-=0.3");
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={boxRef}
          style={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 24px)" }}
          className="rounded-3xl bg-teal-700 px-8 py-16 text-center sm:px-16 sm:py-24"
        >
          <h2
            data-cta-headline
            style={{ opacity: 0 }}
            className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            ¿Listo para dar el siguiente
            <br className="hidden sm:block" /> paso en tu carrera?
          </h2>

          <p
            data-cta-sub
            style={{ opacity: 0 }}
            className="mx-auto mt-5 max-w-xl text-lg text-white/80 leading-relaxed"
          >
            Conecta con el mentor o coach que necesitas. Reserva tu primera sesión hoy
            y empieza a construir la carrera que mereces.
          </p>

          <div
            data-cta-btns
            style={{ opacity: 0 }}
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

          <p className="mt-6 text-sm text-teal-300">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </div>
      </div>
    </section>
  );
}
