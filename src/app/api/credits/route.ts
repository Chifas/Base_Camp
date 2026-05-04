import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTierLimits } from "@/lib/credits-config";

/**
 * GET /api/credits — returns the authenticated client's credit status.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { freeCreditsUsed: true, creditsResetAt: true, subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Auto-reset credits if the month has changed
    const now = new Date();
    const resetAt = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
    let used = user.freeCreditsUsed;

    if (!resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()) {
      used = 0;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freeCreditsUsed: 0, creditsResetAt: now },
      });
    }

    const limit = getTierLimits(user.subscriptionTier).sessionsPerMonth;
    return NextResponse.json({
      used,
      limit,
      remaining: Math.max(0, limit - used),
      resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      tier: user.subscriptionTier,
    });
  } catch (error) {
    console.error("[/api/credits]", error);
    return NextResponse.json({ error: "Error al obtener créditos" }, { status: 500 });
  }
}
