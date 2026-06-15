"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";

/**
 * Sticky CTA that slides up from the bottom of the viewport after the user
 * scrolls past the hero. Dismissible per-session.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("guidepath_sticky_cta_dismissed");
    if (seen === "1") setDismissed(true);

    function onScroll() {
      // Show after scrolling ~80% of viewport height
      const trigger = window.innerHeight * 0.8;
      setVisible(window.scrollY > trigger);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("guidepath_sticky_cta_dismissed", "1");
    } catch {
      // sessionStorage might be blocked — ignore
    }
  }

  if (dismissed) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-3 bottom-3 z-40 flex justify-center transition-all duration-500 sm:bottom-5 sm:inset-x-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-32 opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-teal-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-teal-800 dark:bg-stone-900/95">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 sm:flex">
          <span className="text-base font-bold text-white">3</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-display font-semibold text-stone-900 dark:text-stone-50">
            Tu primera sesión es gratis
          </p>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Sin tarjeta · 3 sesiones al mes · Cancela cuando quieras
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-700 px-4 py-2 text-xs font-display font-semibold text-white transition-colors hover:bg-teal-800 sm:text-sm"
        >
          Empezar
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
