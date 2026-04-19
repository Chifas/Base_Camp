"use client";

import { forwardRef, type HTMLAttributes, type ReactNode, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap-config";

type BentoCardTone =
  | "plain"
  | "glass"
  | "primary"
  | "emerald"
  | "amber"
  | "violet"
  | "rose"
  | "dark";

type BentoCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  span?: string;
  tone?: BentoCardTone;
  interactive?: boolean;
  href?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  accentGradient?: string;
  revealDelay?: number;
  noBorder?: boolean;
};

const TONE_CLASSES: Record<BentoCardTone, string> = {
  plain: "bg-card",
  glass:
    "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border-white/50 dark:border-white/10",
  primary:
    "bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white border-indigo-400/30",
  emerald:
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/30",
  amber:
    "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300/40",
  violet:
    "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white border-violet-400/30",
  rose:
    "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-rose-400/30",
  dark:
    "bg-zinc-950 text-white border-white/10",
};

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(function BentoCard(
  {
    span = "col-span-2 md:col-span-4",
    tone = "plain",
    interactive = false,
    href,
    eyebrow,
    title,
    description,
    icon,
    footer,
    media,
    children,
    accentGradient,
    className,
    noBorder,
    onMouseMove: _onMouseMove,
    ...rest
  },
  ref
) {
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (!interactive) return;
      const el = innerRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });
      const xTo = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
      const scaleTo = gsap.quickTo(el, "scale", { duration: 0.4, ease: "power3.out" });

      const onMove = contextSafe!((e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = -((e.clientY - rect.top) / rect.height - 0.5) * 8;
        xTo(x);
        yTo(y);
        scaleTo(1.015);
      });

      const onLeave = contextSafe!(() => {
        xTo(0);
        yTo(0);
        scaleTo(1);
      });

      el.addEventListener("pointermove", onMove as EventListener);
      el.addEventListener("pointerleave", onLeave as EventListener);

      return () => {
        el.removeEventListener("pointermove", onMove as EventListener);
        el.removeEventListener("pointerleave", onLeave as EventListener);
      };
    },
    { scope: innerRef, dependencies: [interactive] }
  );

  const content = (
    <div
      ref={innerRef}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl",
        noBorder ? "" : "border",
        TONE_CLASSES[tone],
        "transition-shadow duration-500",
        interactive && "will-change-transform hover:shadow-2xl",
        "p-6 sm:p-7"
      )}
      data-bento-tilt
    >
      {accentGradient && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            accentGradient
          )}
        />
      )}

      {media && (
        <div className="relative mb-5 overflow-hidden rounded-2xl">{media}</div>
      )}

      {(eyebrow || icon) && (
        <div className="relative z-[1] mb-4 flex items-center justify-between gap-3">
          {icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/50 text-current backdrop-blur ring-1 ring-white/10">
              {icon}
            </div>
          )}
          {eyebrow && (
            <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
              {eyebrow}
            </span>
          )}
        </div>
      )}

      {title && (
        <h3 className="relative z-[1] font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h3>
      )}

      {description && (
        <p className="relative z-[1] mt-2 text-sm leading-relaxed opacity-80 sm:text-base">
          {description}
        </p>
      )}

      {children && <div className="relative z-[1] mt-auto">{children}</div>}

      {footer && (
        <div className="relative z-[1] mt-5 flex items-center justify-between text-sm opacity-90">
          {footer}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("block h-full", span, className)}
        data-bento-card
        ref={ref as unknown as never}
        {...(rest as unknown as Record<string, unknown>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      data-bento-card
      className={cn("h-full", span, className)}
      {...rest}
    >
      {content}
    </div>
  );
});
