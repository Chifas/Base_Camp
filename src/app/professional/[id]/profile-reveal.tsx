"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";

export function ProfileReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const backLink = root.querySelector<HTMLElement>("[data-profile-enter]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", root);

      if (reduced) {
        if (backLink) gsap.set(backLink, { opacity: 1, y: 0 });
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      if (backLink) {
        gsap.fromTo(
          backLink,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" }
        );
      }

      gsap.set(cards, { opacity: 0, y: 48, scale: 0.96 });

      const batch = ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (els) => {
          gsap.to(els, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "expo.out",
            stagger: { amount: 0.55, from: "start" },
            overwrite: "auto",
          });
        },
      });

      // Initial cards visible on page load → animate first batch immediately
      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => batch.forEach((st) => st.kill());
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}
