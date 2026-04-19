"use client";

import { useRef, type RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

type RevealOptions = {
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
  scale?: number;
};

/**
 * Reveals bento cards in sync as they enter the viewport.
 * Uses ScrollTrigger.batch so cards that enter together animate together
 * with a stagger, rather than one-by-one as they cross the threshold.
 */
export function useBentoReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {}
): RefObject<T> {
  const {
    selector = "[data-bento-card]",
    y = 40,
    duration = 0.9,
    stagger = 0.08,
    start = "top 88%",
    once = true,
    scale = 0.97,
  } = options;

  const scopeRef = useRef<T>(null);

  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>(selector, root);
      if (!cards.length) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y, scale, willChange: "transform, opacity" });

      const batch = ScrollTrigger.batch(cards, {
        start,
        once,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration,
            ease: "expo.out",
            stagger: { amount: stagger * els.length, from: "start" },
            overwrite: "auto",
          });
        },
      });

      return () => {
        batch.forEach((st) => st.kill());
      };
    },
    { scope: scopeRef, dependencies: [selector, y, duration, stagger, start, once, scale] }
  );

  return scopeRef;
}

/**
 * Attach a subtle 3D tilt to a card when the cursor moves across it.
 * Pair with data-bento-tilt on the element receiving the transform.
 */
export function useBentoTilt<T extends HTMLElement = HTMLElement>(strength = 8): RefObject<T> {
  const ref = useRef<T>(null);

  useGSAP(
    (_, contextSafe) => {
      const card = ref.current;
      if (!card) return;

      const inner = card.querySelector<HTMLElement>("[data-bento-tilt]") ?? card;

      const xTo = gsap.quickTo(inner, "rotateY", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(inner, "rotateX", { duration: 0.5, ease: "power3.out" });

      gsap.set(inner, { transformPerspective: 900, transformStyle: "preserve-3d" });

      const onMove = contextSafe!((e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength * 2;
        const y = -((e.clientY - rect.top) / rect.height - 0.5) * strength * 2;
        xTo(x);
        yTo(y);
      });

      const onLeave = contextSafe!(() => {
        xTo(0);
        yTo(0);
      });

      card.addEventListener("pointermove", onMove as EventListener);
      card.addEventListener("pointerleave", onLeave as EventListener);

      return () => {
        card.removeEventListener("pointermove", onMove as EventListener);
        card.removeEventListener("pointerleave", onLeave as EventListener);
      };
    },
    { scope: ref }
  );

  return ref;
}
