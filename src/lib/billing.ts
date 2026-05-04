import type { SubscriptionTier } from "@prisma/client";
import { prisma } from "./prisma";
import { stripe } from "./stripe";

/**
 * Look up or create a Stripe Customer for a user. Persists `stripeCustomerId`
 * on the User row so subsequent calls are O(1).
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  if (!stripe) throw new Error("Stripe is not configured");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (!user?.email) throw new Error("User has no email");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    ...(user.name ? { name: user.name } : {}),
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

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
