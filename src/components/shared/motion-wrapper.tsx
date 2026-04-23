"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

// ─── FadeIn ──────────────────────────────────────────────────────────────────

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

const directionMap = {
  up: { y: 48, x: 0 },
  down: { y: -48, x: 0 },
  left: { x: 48, y: 0 },
  right: { x: -48, y: 0 },
};

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.8,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const offset = directionMap[direction];
    gsap.fromTo(
      el,
      { opacity: 0, ...offset },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// ─── StaggerContainer + StaggerItem ──────────────────────────────────────────

export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>("[data-stagger-item]", ref.current!);
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 36, scale: 0.96 });

    ScrollTrigger.batch(items, {
      start: "top 86%",
      once: true,
      onEnter: (els) => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "expo.out",
          stagger: 0.1,
          delay,
        });
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-stagger-item className={className}>
      {children}
    </div>
  );
}

// ─── ScaleIn ─────────────────────────────────────────────────────────────────

export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
