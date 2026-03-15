import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stripe/transfers — list completed sessions with transfer info
 * for the authenticated professional.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    // Fetch completed sessions with transfer data
    const completedSessions = await prisma.session.findMany({
      where: {
        professionalId: profile.id,
        status: "COMPLETED",
      },
      select: {
        id: true,
        price: true,
        scheduledAt: true,
        stripeTransferId: true,
        client: { select: { name: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const PLATFORM_COMMISSION = 0.15;

    const transfers = completedSessions.map((s) => ({
      sessionId: s.id,
      clientName: s.client.name ?? "Cliente",
      scheduledAt: s.scheduledAt,
      grossAmount: s.price,
      commission: Math.round(s.price * PLATFORM_COMMISSION * 100) / 100,
      netAmount: Math.round(s.price * (1 - PLATFORM_COMMISSION) * 100) / 100,
      transferred: !!s.stripeTransferId,
      stripeTransferId: s.stripeTransferId,
    }));

    const totalGross = transfers.reduce((acc, t) => acc + t.grossAmount, 0);
    const totalNet = transfers.reduce((acc, t) => acc + t.netAmount, 0);
    const totalCommission = transfers.reduce((acc, t) => acc + t.commission, 0);

    return NextResponse.json({
      transfers,
      summary: {
        totalGross: Math.round(totalGross * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalSessions: transfers.length,
        transferredCount: transfers.filter((t) => t.transferred).length,
      },
    });
  } catch (error) {
    console.error("[/api/stripe/transfers]", error);
    return NextResponse.json(
      { error: "Error al obtener transferencias" },
      { status: 500 }
    );
  }
}
