import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/session-cleanup — clean up stale sessions.
 *
 * 1. Cancels PENDING sessions older than 24 hours (never confirmed).
 * 2. Cancels CONFIRMED sessions past due by 4+ hours (never completed).
 *
 * Protected by CRON_SECRET header.
 */
export async function GET(req: Request) {
  const cronSecret =
    req.headers.get("x-cron-secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Cancel PENDING sessions older than 24 hours (expired, never confirmed)
    const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const expiredResult = await prisma.session.updateMany({
      where: {
        status: "PENDING",
        scheduledAt: { lt: expiredCutoff },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelledBy: "system",
      },
    });

    // 2. Cancel CONFIRMED sessions that are past due (scheduledAt + 4h grace passed)
    const pastDueCutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const pastDueResult = await prisma.session.updateMany({
      where: {
        status: "CONFIRMED",
        scheduledAt: { lt: pastDueCutoff },
      },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelledBy: "system",
      },
    });

    logger.info("Session cleanup completed", {
      expiredCancelled: expiredResult.count,
      pastDueCancelled: pastDueResult.count,
    });

    return NextResponse.json({
      success: true,
      expiredCancelled: expiredResult.count,
      pastDueCancelled: pastDueResult.count,
    });
  } catch (error) {
    logger.error("Session cleanup failed", { error: String(error) });
    return NextResponse.json({ error: "Error en limpieza de sesiones" }, { status: 500 });
  }
}
