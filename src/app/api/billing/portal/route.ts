import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!stripe) {
    return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No tienes una suscripción que gestionar" },
      { status: 404 },
    );
  }

  try {
    const baseUrl = env.NEXTAUTH_URL || "http://localhost:3000";
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/client?tab=subscription`,
    });
    return NextResponse.json({ portalUrl: portal.url });
  } catch (error) {
    logger.error("Stripe portal error", { error: String(error) });
    return NextResponse.json(
      { error: "Error al abrir el portal de facturación" },
      { status: 500 },
    );
  }
}
