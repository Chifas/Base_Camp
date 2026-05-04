import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the user's subscription state for the dashboard. Reads only from the
 * DB — billing webhook keeps it fresh, so we never call Stripe per-request.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      subscriptionInterval: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    endsAt: user.subscriptionEndsAt?.toISOString() ?? null,
    interval: user.subscriptionInterval,
    hasActiveSubscription: !!user.stripeSubscriptionId,
  });
}
