"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap-config";
import { Button } from "@/components/ui/button";

type Accent = "teal" | "amber" | "emerald";

interface MetricSlot {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: Accent;
}

interface ActionSlot {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface DashboardHeroProps {
  name: string;
  avatar?: string | null;
  greeting: string;
  subtitle: string;
  primaryAction: ActionSlot;
  featuredMetric?: MetricSlot;
  accentColor?: Accent;
}

const ACCENT_TEXT: Record<Accent, string> = {
  teal: "text-teal-600 dark:text-teal-400",
  amber: "text-amber-600 dark:text-amber-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
};

const ACCENT_BG: Record<Accent, string> = {
  teal: "bg-teal-100 dark:bg-teal-900/30",
  amber: "bg-amber-100 dark:bg-amber-900/30",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30",
};

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "•";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function DashboardHero({
  name,
  avatar,
  greeting,
  subtitle,
  primaryAction,
  featuredMetric,
  accentColor = "teal",
}: DashboardHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const avatarEl = root.querySelector<HTMLElement>("[data-hero-avatar]");
      const textEl = root.querySelector<HTMLElement>("[data-hero-text]");
      const metricEl = root.querySelector<HTMLElement>("[data-hero-metric]");
      const ctaEl = root.querySelector<HTMLElement>("[data-hero-cta]");

      const tl = gsap.timeline();
      if (avatarEl) tl.from(avatarEl, { scale: 0.85, duration: 0.55, ease: "back.out(1.6)" }, 0);
      if (textEl) tl.from(textEl, { y: 12, duration: 0.55, ease: "power3.out" }, 0.05);
      if (ctaEl) tl.from(ctaEl, { y: 8, duration: 0.45, ease: "power3.out" }, 0.18);
      if (metricEl) tl.from(metricEl, { x: 16, duration: 0.55, ease: "power3.out" }, 0.1);
    },
    { scope: rootRef }
  );

  const PrimaryIcon = primaryAction.icon;
  const MetricIcon = featuredMetric?.icon;
  const metricAccent: Accent = featuredMetric?.accent ?? accentColor;

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 p-6 sm:p-8 lg:p-10 dark:border-stone-800 dark:from-teal-950/20 dark:via-stone-950 dark:to-emerald-950/10"
    >
      {/* Subtle dot pattern */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] dark:opacity-[0.07]"
      >
        <defs>
          <pattern id="dashboard-hero-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dashboard-hero-dots)" />
      </svg>

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: avatar + text + CTA */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              data-hero-avatar
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-stone-200 ring-4 ring-white shadow-lg dark:bg-stone-800 dark:ring-stone-900 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 96px, (min-width: 640px) 80px, 64px"
                  className="object-cover"
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center font-display text-xl font-bold sm:text-2xl lg:text-3xl ${ACCENT_TEXT[accentColor]}`}
                >
                  {getInitials(name)}
                </div>
              )}
            </div>

            <div data-hero-text className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-bold leading-tight text-stone-900 sm:text-2xl lg:text-3xl dark:text-stone-50">
                {greeting}
              </h1>
              <p className="mt-1 text-sm text-stone-600 sm:text-base dark:text-stone-400">
                {subtitle}
              </p>
            </div>
          </div>

          {/* CTA spans full width on mobile, sits below avatar+text on every breakpoint */}
          <div data-hero-cta className="mt-4">
            <Button
              asChild
              size="sm"
              className="w-full bg-teal-600 text-white hover:bg-teal-700 sm:w-auto"
            >
              <Link href={primaryAction.href}>
                {PrimaryIcon ? <PrimaryIcon className="mr-2 h-4 w-4 shrink-0" /> : null}
                <span className="truncate">{primaryAction.label}</span>
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: featured metric */}
        {featuredMetric ? (
          <div
            data-hero-metric
            className="rounded-2xl bg-white/70 p-4 ring-1 ring-stone-200 backdrop-blur-sm sm:min-w-[180px] dark:bg-stone-900/60 dark:ring-stone-800"
          >
            <div className="flex items-center gap-2">
              {MetricIcon ? (
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${ACCENT_BG[metricAccent]}`}
                >
                  <MetricIcon className={`h-4 w-4 ${ACCENT_TEXT[metricAccent]}`} />
                </span>
              ) : null}
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {featuredMetric.label}
              </p>
            </div>
            <p
              className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${ACCENT_TEXT[metricAccent]}`}
            >
              {featuredMetric.value}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
