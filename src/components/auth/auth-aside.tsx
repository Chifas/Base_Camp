"use client";

import Image from "next/image";
import { Sparkles, Star, Gift, Video } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Dark aurora bento panel shown on the left of auth pages (login/register).
 * Renders only on `lg+` breakpoints — hidden on mobile/tablet.
 */
export function AuthAside({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <aside className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-10 text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(50% 50% at 90% 80%, rgba(236,72,153,0.35) 0%, transparent 65%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top: brand */}
      <div className="relative z-[1] flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="GuidePath"
          width={40}
          height={36}
          className="h-9 w-auto brightness-200 saturate-200"
        />
        <span className="font-heading text-lg font-bold">GuidePath</span>
      </div>

      {/* Middle: big pitch */}
      <div className="relative z-[1] flex flex-1 flex-col justify-center">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 ring-1 ring-white/15 backdrop-blur">
          <Sparkles className="h-3 w-3" /> {eyebrow}
        </div>
        <h2 className="mt-5 font-heading text-4xl font-bold leading-[1.05] tracking-tight xl:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-white/75">{subtitle}</p>
      </div>

      {/* Bottom: feature chips */}
      <div className="relative z-[1] grid grid-cols-3 gap-3">
        <FeaturePill
          icon={<Gift className="h-4 w-4" />}
          label="3 sesiones gratis al mes"
        />
        <FeaturePill icon={<Video className="h-4 w-4" />} label="Videollamada HD" />
        <FeaturePill icon={<Star className="h-4 w-4" />} label="4,9 ★ media" />
      </div>
    </aside>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/90 backdrop-blur-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
        {icon}
      </div>
      <span className="font-medium leading-tight">{label}</span>
    </div>
  );
}
