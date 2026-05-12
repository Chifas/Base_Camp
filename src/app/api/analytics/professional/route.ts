import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/analytics/professional
 *
 * Returns analytics for the authenticated professional:
 * - Profile views (last 30 days, by day)
 * - Sessions booked (last 30 days)
 * - Conversion rate (bookings / views)
 * - Impact points earned by month (last 6 months)
 * - Average NPS from feedback
 */
export async function GET() {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const profile = await prisma.professionalProfile.findUnique({
    where:  { userId: auth.user.id },
    select: { id: true, totalSessionsCompleted: true, impactPoints: true, rating: true, reviewCount: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo  = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [views, bookings, completedThisMonth, monthlySessions, npsAgg] = await Promise.all([
    prisma.profileView.findMany({
      where:   { professionalId: profile.id, createdAt: { gte: thirtyDaysAgo } },
      select:  { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.session.count({
      where: {
        professionalId: profile.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.session.count({
      where: {
        professionalId: profile.id,
        status: "COMPLETED",
        scheduledAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt:  new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    }),
    prisma.session.findMany({
      where: {
        professionalId: profile.id,
        status: "COMPLETED",
        scheduledAt: { gte: sixMonthsAgo },
      },
      select: { scheduledAt: true },
    }),
    prisma.sessionFeedback.aggregate({
      where: {
        userId: { not: auth.user.id },
        session: { professionalId: profile.id },
      },
      _avg:   { npsScore: true },
      _count: { _all: true },
    }),
  ]);

  // Bucket views by day (YYYY-MM-DD) for the last 30 days
  const viewsByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    viewsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of views) {
    const day = v.createdAt.toISOString().slice(0, 10);
    if (day in viewsByDay) viewsByDay[day]! += 1;
  }
  const viewsTimeline = Object.entries(viewsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => ({ day, count }));

  // Bucket completed sessions by month (YYYY-MM)
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const sessionsByMonth: Record<string, number> = Object.fromEntries(monthLabels.map((m) => [m, 0]));
  for (const s of monthlySessions) {
    const m = `${s.scheduledAt.getFullYear()}-${String(s.scheduledAt.getMonth() + 1).padStart(2, "0")}`;
    if (m in sessionsByMonth) sessionsByMonth[m]! += 1;
  }
  const monthlyTimeline = monthLabels.map((m) => ({
    month: m,
    sessions: sessionsByMonth[m] ?? 0,
  }));

  const totalViews30d = views.length;
  const conversionRate = totalViews30d > 0 ? bookings / totalViews30d : 0;

  return NextResponse.json({
    summary: {
      totalViews30d,
      bookings30d: bookings,
      conversionRate,
      completedThisMonth,
      totalSessionsCompleted: profile.totalSessionsCompleted,
      impactPoints: profile.impactPoints,
      avgRating: profile.rating,
      reviewCount: profile.reviewCount,
      npsAverage: npsAgg._avg.npsScore ?? null,
      npsCount: npsAgg._count._all,
    },
    viewsTimeline,
    monthlyTimeline,
  });
}
