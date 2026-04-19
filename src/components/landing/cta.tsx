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
    const box = boxRef.current;
    if (!box) return;

    const icon = box.querySelector<HTMLElement>("[data-cta-icon]");
    const headline = box.querySelector<HTMLElement>("[data-cta-headline]");
    const sub = box.querySelector<HTMLElement>("[data-cta-sub]");
    const btns = box.querySelector<HTMLElement>("[data-cta-btns]");
    const blob1 = box.querySelector<HTMLElement>("[data-blob-1]");
    const blob2 = box.querySelector<HTMLElement>("[data-blob-2]");
    const blob3 = box.querySelector<HTMLElement>("[data-blob-3]");

    // Blob floats
    if (blob1) gsap.to(blob1, { x: 30, y: -20, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });
    if (blob2) gsap.to(blob2, { x: -25, y: 25, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
    if (blob3) gsap.to(blob3, { scale: 1.25, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1 });

    // Icon pulse
    if (icon) {
      gsap.to(icon, { rotation: 12, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
    }

    // Clip-path wipe reveal on scroll
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
      .fromTo(icon, { opacity: 0, scale: 0.5, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.4")
      .fromTo(headline, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }, "-=0.3")
      .fromTo(sub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" }, "-=0.3")
      .fromTo(btns, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, "-=0.25");
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={boxRef}
          data-gsap-clip
          className="relative overflow-hidden rounded-3xl cta-gradient px-8 py-16 text-center sm:px-16 sm:py-24"
        >
          {/* Border glow */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-primary via-violet-500 to-primary opacity-20 blur-sm animate-pulse-glow" />

          {/* Blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div data-blob-1 className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl will-change-transform" />
            <div data-blob-2 className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl will-change-transform" />
            <div data-blob-3 className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl will-change-transform" />
          </div>

          <div className="relative">
            <div
              data-cta-icon
              data-gsap-init
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <h2
              data-cta-headline
              data-gsap-init
              className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
            >
              ¿Listo para dar el siguiente
              <br className="hidden sm:block" /> paso en tu carrera?
            </h2>

            <p
              data-cta-sub
              data-gsap-init
              className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/80 leading-relaxed"
            >
              Conecta con el mentor o coach que necesitas. Reserva tu primera
              sesión hoy y empieza a construir la carrera que mereces.
            </p>

            <div
              data-cta-btns
              data-gsap-init
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto group !bg-white !text-indigo-700 hover:!bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)] transition-all h-12 px-8 text-base font-semibold"
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
                className="w-full sm:w-auto !border-white/40 !text-white !bg-white/10 hover:!bg-white/20 hover:!border-white/60 h-12 px-8 text-base font-medium backdrop-blur-sm"
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
