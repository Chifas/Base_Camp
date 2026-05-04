import type { SubscriptionTier } from "@prisma/client";

/**
 * Stripe subscription status → app subscription tier.
 *
 * Trialing and active grant Premium. past_due/unpaid/canceled/incomplete_expired
 * revoke access. We deliberately keep PREMIUM during `paused`/`incomplete`
 * for a short grace period — Stripe will fire follow-up events.
 */
export function mapSubscriptionStatusToTier(
  status: string | null | undefined,
): SubscriptionTier {
  switch (status) {
    case "active":
    case "trialing":
      return "PREMIUM";
    case "past_due":
    case "unpaid":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    default:
      return "FREE";
  }
}

/** Stripe `recurring.interval` → human-readable label used in emails/UI. */
export function intervalLabel(interval: string | null | undefined): string {
  if (interval === "year") return "anual";
  if (interval === "month") return "mensual";
  return "";
}
