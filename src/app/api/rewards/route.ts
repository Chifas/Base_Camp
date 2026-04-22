import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { logger } from "@/lib/logger";
import { redeemRewardSchema } from "@/lib/validations";

/**
 * GET /api/rewards — returns the professional's impact points and redemption history.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        impactPoints: true,
        totalSessionsCompleted: true,
        socialImpactScore: true,
        redemptions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      impactPoints: profile.impactPoints,
      totalSessionsCompleted: profile.totalSessionsCompleted,
      socialImpactScore: profile.socialImpactScore,
      redemptions: profile.redemptions,
      config: {
        pointsPerSession: CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION,
        certificationCost: CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION,
        donationCost: CREDITS_CONFIG.IMPACT_POINTS_DONATION,
      },
    });
  } catch (error) {
    console.error("[/api/rewards]", error);
    return NextResponse.json({ error: "Error al obtener recompensas" }, { status: 500 });
  }
}

/**
 * POST /api/rewards — redeem impact points for a certification or donation.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = redeemRewardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }
    const { type, description } = parsed.data;

    const pointsCost =
      type === "CERTIFICATION"
        ? CREDITS_CONFIG.IMPACT_POINTS_CERTIFICATION
        : CREDITS_CONFIG.IMPACT_POINTS_DONATION;

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, impactPoints: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (profile.impactPoints < pointsCost) {
      return NextResponse.json(
        { error: `Necesitas ${pointsCost} puntos. Tienes ${profile.impactPoints}.` },
        { status: 403 }
      );
    }

    // Atomic: deduct points + create redemption
    const [updatedProfile, redemption] = await prisma.$transaction([
      prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { impactPoints: { decrement: pointsCost } },
      }),
      prisma.rewardRedemption.create({
        data: {
          professionalId: profile.id,
          type,
          pointsSpent: pointsCost,
          description: description || (type === "CERTIFICATION" ? "Certificación profesional" : "Donación filantrópica"),
        },
      }),
    ]);

    logger.info("Reward redeemed", {
      professionalId: profile.id,
      type,
      pointsSpent: pointsCost,
      remaining: updatedProfile.impactPoints,
    });

    return NextResponse.json({
      redemption,
      impactPointsRemaining: updatedProfile.impactPoints,
    });
  } catch (error) {
    logger.error("Error redeeming reward", { error: String(error) });
    return NextResponse.json({ error: "Error al canjear recompensa" }, { status: 500 });
  }
}
