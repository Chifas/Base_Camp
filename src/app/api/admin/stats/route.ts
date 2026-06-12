import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

/** GET /api/admin/stats — platform-wide metrics for the admin dashboard. */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      totalProfessionals,
      verifiedProfessionals,
      totalSessions,
      completedSessions,
      sessionsLast30d,
      totalReviews,
      reportedReviews,
      waitlistCount,
      avgRating,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "PROFESSIONAL" } }),
      prisma.professionalProfile.count({ where: { verified: true } }),
      prisma.session.count(),
      prisma.session.count({ where: { status: "COMPLETED" } }),
      prisma.session.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.review.count(),
      prisma.review.count({ where: { reported: true } }),
      prisma.waitlistEntry.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    return NextResponse.json({
      users: {
        clients: totalClients,
        professionals: totalProfessionals,
        verifiedProfessionals,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        last30d: sessionsLast30d,
      },
      reviews: {
        total: totalReviews,
        reported: reportedReviews,
        avgRating: avgRating._avg.rating ?? 0,
      },
      waitlist: waitlistCount,
    });
  } catch (error) {
    logger.error("Error en admin stats", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
