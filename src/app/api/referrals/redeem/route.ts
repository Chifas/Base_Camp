import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redeemReferralSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

/**
 * POST /api/referrals/redeem — redeem a referral code.
 *
 * Body: { code: "GP-XXXXXXXX" }
 *
 * Rules:
 *   - Can't redeem your own code
 *   - Code must exist and be PENDING
 *   - Code must not be expired
 *   - Referral type must match: PRO codes for PROs, CLIENT codes for CLIENTs
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = redeemReferralSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { code } = parsed.data;

    const referral = await prisma.referral.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        referrer: { select: { id: true, name: true, role: true } },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Código de referido no encontrado" },
        { status: 404 }
      );
    }

    // Self-referral check
    if (referral.referrerId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes usar tu propio código de referido" },
        { status: 400 }
      );
    }

    // Already used
    if (referral.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este código ya ha sido utilizado" },
        { status: 409 }
      );
    }

    // Expired check
    if (referral.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este código ha expirado" },
        { status: 410 }
      );
    }

    // Role match check
    const userRole = session.user.role;
    if (
      (referral.type === "PROFESSIONAL_TO_PROFESSIONAL" && userRole !== "PROFESSIONAL") ||
      (referral.type === "CLIENT_TO_CLIENT" && userRole !== "CLIENT")
    ) {
      return NextResponse.json(
        { error: "Este código no es válido para tu tipo de cuenta" },
        { status: 403 }
      );
    }

    // Check user hasn't already been referred
    const alreadyReferred = await prisma.referral.findFirst({
      where: {
        referredId: session.user.id,
        status: "COMPLETED",
      },
    });

    if (alreadyReferred) {
      return NextResponse.json(
        { error: "Ya has utilizado un código de referido anteriormente" },
        { status: 409 }
      );
    }

    // Complete the referral
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId: session.user.id,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Notify the referrer
    void createNotification({
      userId: referral.referrerId,
      type: "PAYMENT_RECEIVED",
      title: "¡Referido completado!",
      message: referral.type === "CLIENT_TO_CLIENT"
        ? `Un amigo ha usado tu código. Tienes ${referral.creditAmount}€ de crédito.`
        : "Un colega se ha registrado con tu código. Disfrutarás de comisión reducida el primer mes.",
      link: userRole === "PROFESSIONAL" ? "/dashboard/professional" : "/dashboard/client",
    });

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/professional");

    return NextResponse.json({
      success: true,
      message: referral.type === "CLIENT_TO_CLIENT"
        ? `¡Código canjeado! Tienes ${referral.creditAmount}€ de crédito para tu próxima sesión.`
        : "¡Código canjeado! Disfrutarás de comisión reducida durante tu primer mes.",
    });
  } catch (error) {
    console.error("[/api/referrals/redeem POST]", error);
    return NextResponse.json(
      { error: "Error al canjear referido" },
      { status: 500 }
    );
  }
}
