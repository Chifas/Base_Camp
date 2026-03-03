import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

interface CheckoutBody {
  professionalId: string;
  priceRuleId: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body: CheckoutBody = await request.json();
  const { professionalId, priceRuleId } = body;

  if (!professionalId || !priceRuleId) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Validate the price rule belongs to this professional and is active
  const priceRule = await prisma.priceRule.findUnique({
    where: { id: priceRuleId },
    include: {
      professional: {
        select: { id: true, stripeAccountId: true, user: { select: { name: true } } },
      },
    },
  });

  if (
    !priceRule ||
    !priceRule.active ||
    priceRule.professionalId !== professionalId
  ) {
    return NextResponse.json({ error: "Tarifa inválida" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const amountCents = Math.round(priceRule.price * 100);
  const platformFeeCents = Math.round(amountCents * 0.1); // 10% platform commission

  const checkoutParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: priceRule.name,
            ...(priceRule.description && { description: priceRule.description }),
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      professionalId,
      priceRuleId,
      clientEmail: session.user.email,
    },
    success_url: `${baseUrl}/dashboard/client?payment=success`,
    cancel_url: `${baseUrl}/book/${professionalId}`,
  };

  // Apply Stripe Connect transfer if the professional has a Stripe account
  if (priceRule.professional.stripeAccountId) {
    checkoutParams.payment_intent_data = {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: priceRule.professional.stripeAccountId,
      },
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

  return NextResponse.json({ url: checkoutSession.url });
}
