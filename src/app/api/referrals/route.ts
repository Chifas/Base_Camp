import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReferralSchema } from "@/lib/validations";
import { nanoid } from "nanoid";

/**
 * GET /api/referrals — list the authenticated user's referrals.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referred: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const completed = referrals.filter((r) => r.status === "COMPLETED");
    const totalCredits = completed.reduce((sum, r) => sum + (r.creditAmount ?? 0), 0);

    return NextResponse.json({
      referrals: referrals.map((r) => ({
        id: r.id,
        code: r.code,
        type: r.type,
        status: r.status,
        creditAmount: r.creditAmount,
        referredName: r.referred?.name ?? null,
        referredImage: r.referred?.image ?? null,
        completedAt: r.completedAt,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      })),
      stats: {
        total: referrals.length,
        completed: completed.length,
        pending: referrals.filter((r) => r.status === "PENDING").length,
        totalCredits,
      },
    });
  } catch (error) {
    console.error("[/api/referrals GET]", error);
    return NextResponse.json(
      { error: "Error al obtener referidos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals — generate a new referral code.
 *
 * Body: { type: "PROFESSIONAL_TO_PROFESSIONAL" | "CLIENT_TO_CLIENT" }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createReferralSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type } = parsed.data;

    // Validate role matches referral type
    const userRole = session.user.role;
    if (type === "PROFESSIONAL_TO_PROFESSIONAL" && userRole !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Solo profesionales pueden crear referidos profesional→profesional" },
        { status: 403 }
      );
    }
    if (type === "CLIENT_TO_CLIENT" && userRole !== "CLIENT") {
      return NextResponse.json(
        { error: "Solo clientes pueden crear referidos cliente→cliente" },
        { status: 403 }
      );
    }

    // Check active referral limit (max 10 active codes per user)
    const activeCount = await prisma.referral.count({
      where: {
        referrerId: session.user.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (activeCount >= 10) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de códigos de referido activos (10)" },
        { status: 429 }
      );
    }

    // Generate unique referral code (8 chars, URL-safe)
    const code = `GP-${nanoid(8).toUpperCase()}`;

    // Credit amounts
    const creditAmount = type === "PROFESSIONAL_TO_PROFESSIONAL"
      ? 0 // Reduced commission, handled at transfer time
      : 10; // €10 credit for next session

    const referral = await prisma.referral.create({
      data: {
        code,
        type,
        referrerId: session.user.id,
        creditAmount,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/professional");

    return NextResponse.json({
      id: referral.id,
      code: referral.code,
      type: referral.type,
      creditAmount: referral.creditAmount,
      expiresAt: referral.expiresAt,
    }, { status: 201 });
  } catch (error) {
    console.error("[/api/referrals POST]", error);
    return NextResponse.json(
      { error: "Error al crear referido" },
      { status: 500 }
    );
  }
}
