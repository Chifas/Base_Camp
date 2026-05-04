import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { PREMIUM_PRICING } from "@/lib/credits-config";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  interval: z.enum(["month", "year"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!stripe) {
    return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Intervalo inválido" }, { status: 400 });
  }
  const { interval } = parsed.data;

  const priceId =
    interval === "year"
      ? env.STRIPE_PREMIUM_YEARLY_PRICE_ID
      : env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Producto Premium no configurado" },
      { status: 503 },
    );
  }

  // Reject if user already has an active subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true, subscriptionStatus: true },
  });
  if (
    user?.stripeSubscriptionId &&
    user.subscriptionStatus &&
    !["canceled", "incomplete_expired"].includes(user.subscriptionStatus)
  ) {
    return NextResponse.json(
      { error: "Ya tienes una suscripción activa" },
      { status: 409 },
    );
  }

  try {
    const customerId = await getOrCreateStripeCustomer(session.user.id);
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: PREMIUM_PRICING.trialDays,
        metadata: { userId: session.user.id },
      },
      success_url: `${baseUrl}/dashboard/client?tab=subscription&welcome=premium`,
      cancel_url: `${baseUrl}/precios?canceled=1`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    logger.error("Premium checkout error", { error: String(error) });
    return NextResponse.json(
      { error: "Error al crear la sesión de pago" },
      { status: 500 },
    );
  }
}
