"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-config";

export function AnimatedGradientBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const orbs = containerRef.current?.querySelectorAll<HTMLElement>("[data-orb]");
    if (!orbs) return;
    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        x: i % 2 === 0 ? 50 : -50,
        y: i % 2 === 0 ? -30 : 40,
        duration: [28, 22, 32][i] ?? 26,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 3,
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

      {/* ── LIGHT MODE background ── */}
      {/* Base: very subtle warm off-white so it's not pure white */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-b from-slate-50 to-white" />

      {/* Light mode: indigo aurora from top */}
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 h-[70vh] w-[110vw] dark:hidden rounded-full
        bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18)_0%,rgba(139,92,246,0.10)_40%,transparent_70%)]
        blur-[2px]"
      />

      {/* Light mode: right-side violet accent */}
      <div
        data-orb
        className="absolute -right-[5%] top-[15%] h-[50vh] w-[40vw] rounded-full dark:hidden will-change-transform
          bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)]
          blur-[60px]"
      />

      {/* Light mode: left-side blue accent */}
      <div
        data-orb
        className="absolute -left-[5%] top-[25%] h-[45vh] w-[35vw] rounded-full dark:hidden will-change-transform
          bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.10),transparent_70%)]
          blur-[60px]"
      />

      {/* ── DARK MODE background ── */}
      {/* Dark aurora from top */}
      <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 h-[80vh] w-[120vw] hidden dark:block rounded-full
        bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25)_0%,rgba(139,92,246,0.15)_40%,transparent_70%)]
        blur-[1px]"
      />

      {/* Dark left orb */}
      <div
        data-orb
        className="absolute -left-[8%] top-[20%] h-[55vh] w-[45vw] rounded-full hidden dark:block will-change-transform
          bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.20),transparent_70%)]
          blur-[80px]"
      />

      {/* Dark right orb */}
      <div
        data-orb
        className="absolute -right-[6%] top-[30%] h-[50vh] w-[40vw] rounded-full hidden dark:block will-change-transform
          bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_70%)]
          blur-[80px]"
      />

      {/* Dark bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[35vh] w-[70vw] hidden dark:block rounded-full
        bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent)]
        blur-[60px]"
      />

      {/* ── Dot grid (both modes) ── */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--primary) / 0.15) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Dark vignette edges */}
      <div className="absolute inset-0 hidden dark:block
        bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_50%,hsl(var(--background)/0.5)_100%)]"
      />
    </div>
  );
}
