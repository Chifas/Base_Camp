"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap-config";

/**
 * Page-transition wrapper. Starts visible in SSR so if JS fails or hydration
 * is delayed the content never hides. On hydration, GSAP takes over and plays
 * a quick fade+slide. Using `gsap.fromTo` (not `gsap.from`) guarantees the
 * initial state is set synchronously in `useLayoutEffect` via `useGSAP`, so
 * there's no perceptible flash.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Re-run the reveal every time the path changes (App Router keeps <Template>
  // mounted across client navigations).
  const keyRef = useRef(pathname);
  keyRef.current = pathname;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    },
    { dependencies: [pathname], scope: ref }
  );

  // Safety net: if GSAP hook fails for any reason, force visibility after paint.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      if (getComputedStyle(el).opacity === "0") {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
