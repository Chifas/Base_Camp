import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  size?: "sm" | "md";
  label?: string;
}

/**
 * Visual marker for Premium-tier users. Teal→amber gradient with a sparkle icon.
 * Size "sm" is suited for inline use next to names; "md" for headers/cards.
 */
export function PremiumBadge({ className, size = "sm", label = "Premium" }: PremiumBadgeProps) {
  const isMd = size === "md";
  return (
    <span
      title="Suscriptor Premium"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-teal-600 via-teal-500 to-amber-400 font-semibold text-white shadow-sm",
        isMd ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]",
        className,
      )}
    >
      <Sparkles className={isMd ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden="true" />
      {label}
    </span>
  );
}
