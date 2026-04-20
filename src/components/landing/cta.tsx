"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP } from "@/lib/gsap-config";

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = boxRef.current;
    if (!box) return;

    const icon = box.querySelector<HTMLElement>("[data-cta-icon]");
    const headline = box.querySelector<HTMLElement>("[data-cta-headline]");
    const sub = box.querySelector<HTMLElement>("[data-cta-sub]");
    const btns = box.querySelector<HTMLElement>("[data-cta-btns]");

    // Icon subtle float
    if (icon) {
      gsap.to(icon, { y: -6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });
    }

    // Clip-path wipe reveal
    gsap.set(box, { clipPath: "inset(0 0 100% 0 round 24px)", opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: box,
        start: "top 82%",
        once: true,
      },
    });

    tl.to(box, {
        clipPath: "inset(0 0 0% 0 round 24px)",
        opacity: 1,
        duration: 0.9,
        ease: "expo.out",
      })
      .fromTo(icon, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, "-=0.4")
      .fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" }, "-=0.3")
      .fromTo(sub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, "-=0.3")
      .fromTo(btns, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, "-=0.25");
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={boxRef}
          style={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 24px)" }}
          className="relative overflow-hidden rounded-3xl bg-teal-700 px-8 py-16 text-center sm:px-16 sm:py-24"
        >
          {/* Subtle noise texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundSize: "128px 128px",
            }}
          />

          {/* Warm gradient accent — top right */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative">
            <div
              data-cta-icon
              style={{ opacity: 0 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </div>

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
              className="mx-auto mt-5 max-w-xl text-lg text-white/75 leading-relaxed"
            >
              Conecta con el mentor o coach que necesitas. Reserva tu primera
              sesión hoy y empieza a construir la carrera que mereces.
            </p>

            <div
              data-cta-btns
              style={{ opacity: 0 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto group !bg-white !text-teal-700 hover:!bg-white/90 shadow-lg transition-transform duration-180 hover:scale-[1.02] h-12 px-8 text-base font-display font-semibold"
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
                className="w-full sm:w-auto !border-white/40 !text-white !bg-white/10 hover:!bg-white/20 hover:!border-white/60 h-12 px-8 text-base font-display font-medium"
                asChild
              >
                <Link href="/explore">Explorar profesionales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
