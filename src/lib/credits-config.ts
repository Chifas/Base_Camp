import type { SubscriptionTier } from "@prisma/client";

/**
 * Centralized configuration for the freemium credits system.
 *
 * Change these values to adjust limits across the entire app.
 */
export const CREDITS_CONFIG = {
  /** Free sessions a client can book per calendar month. */
  FREE_SESSIONS_PER_MONTH: 3,

  /** Impact points a professional earns per completed session. */
  IMPACT_POINTS_PER_SESSION: 10,

  /** Points required to redeem a certification reward. */
  IMPACT_POINTS_CERTIFICATION: 100,

  /** Points required to redeem a philanthropic donation. */
  IMPACT_POINTS_DONATION: 50,

  /** Max free sessions per client-professional pair per month. */
  MAX_FREE_SESSIONS_PER_PROFESSIONAL: 1,

  /** Available session durations in minutes. */
  SESSION_DURATIONS: [30, 45, 60, 90] as readonly number[],

  /** Default session duration in minutes. */
  DEFAULT_SESSION_DURATION: 60,
} as const;

interface TierLimits {
  sessionsPerMonth: number;
  maxFreePerProfessional: number;
  /** Hours before a session starts during which cancellation is free. 0 means always free. */
  cancellationFreeBefore: number;
  /** Whether the tier can book slots flagged as priorityOnly. */
  priorityBooking: boolean;
  /** Visible "Premium" badge across the product. */
  badge: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    sessionsPerMonth: CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH,
    maxFreePerProfessional: CREDITS_CONFIG.MAX_FREE_SESSIONS_PER_PROFESSIONAL,
    cancellationFreeBefore: 24,
    priorityBooking: false,
    badge: false,
  },
  PREMIUM: {
    sessionsPerMonth: 10,
    maxFreePerProfessional: 2,
    cancellationFreeBefore: 0,
    priorityBooking: true,
    badge: true,
  },
  ENTERPRISE: {
    sessionsPerMonth: 25,
    maxFreePerProfessional: 4,
    cancellationFreeBefore: 0,
    priorityBooking: true,
    badge: true,
  },
};

export function getTierLimits(tier: SubscriptionTier | null | undefined): TierLimits {
  return TIER_LIMITS[tier ?? "FREE"] ?? TIER_LIMITS.FREE;
}

export const PREMIUM_PRICING = {
  monthlyAmount: 19.99,
  yearlyAmount: 199,
  currency: "EUR",
  trialDays: 7,
  yearlyDiscountPercent: 17,
} as const;
