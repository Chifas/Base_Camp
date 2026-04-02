"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-config";

export function AnimatedGradientBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const blobs = gsap.utils.toArray<HTMLElement>("[data-blob]", containerRef.current!);
    const shapes = gsap.utils.toArray<HTMLElement>("[data-shape]", containerRef.current!);

    // Each blob gets a unique floating animation
    blobs.forEach((blob, i) => {
      const xRange = [60, -40, 40, -30][i] ?? 30;
      const yRange = [40, 50, -30, 20][i] ?? 25;
      gsap.to(blob, {
        x: xRange,
        y: yRange,
        duration: [25, 20, 30, 22][i] ?? 24,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 1.5,
      });
    });

    // Shapes float and rotate
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        y: [-30, -25, -20, -35, -22][i] ?? -25,
        rotation: [180, -180, 90, 0, 270][i] ?? 180,
        duration: [18, 22, 15, 20, 25][i] ?? 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.8,
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-violet-50/60 dark:from-transparent dark:via-transparent dark:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/50 via-transparent to-transparent dark:from-transparent dark:via-transparent dark:to-transparent" />

      {/* Blobs */}
      <div data-blob className="absolute left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-[120px] dark:bg-primary/12 will-change-transform" />
      <div data-blob className="absolute right-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-violet-400/12 blur-[100px] dark:bg-violet-500/10 will-change-transform" />
      <div data-blob className="absolute bottom-[5%] left-[30%] h-[350px] w-[350px] rounded-full bg-blue-400/10 blur-[100px] will-change-transform" />
      <div data-blob className="absolute right-[25%] bottom-[15%] h-[300px] w-[300px] rounded-full bg-pink-300/8 blur-[90px] dark:bg-transparent will-change-transform" />

      {/* Floating shapes */}
      <div data-shape className="absolute left-[15%] top-[20%] h-4 w-4 rounded-sm border border-primary/15 dark:border-primary/20 bg-primary/5 dark:bg-transparent" />
      <div data-shape className="absolute right-[20%] top-[15%] h-3 w-3 rounded-full border border-violet-500/15 dark:border-violet-500/20 bg-violet-500/5 dark:bg-transparent" />
      <div data-shape className="absolute left-[60%] top-[60%] h-5 w-5 rounded-sm border border-primary/12 dark:border-primary/15 bg-primary/3 dark:bg-transparent" />
      <div data-shape className="absolute left-[10%] bottom-[25%] h-3 w-3 rounded-full border border-blue-500/15 dark:border-blue-500/20 bg-blue-500/5 dark:bg-transparent" />
      <div data-shape className="absolute right-[10%] bottom-[40%] h-4 w-4 rounded-sm border border-violet-500/12 dark:border-violet-500/15 bg-violet-500/3 dark:bg-transparent" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial glow behind headline */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-indigo-100/40 blur-[100px] dark:bg-primary/5" />
    </div>
  );
}
