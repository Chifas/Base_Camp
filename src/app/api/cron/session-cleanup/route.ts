import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const cronSecret =
    req.headers.get("x-cron-secret") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Cancel PENDING sessions older than 24 hours
    const expiredCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const expiredSessions = await prisma.session.findMany({
      where: { status: "PENDING", scheduledAt: { lt: expiredCutoff } },
      select: { id: true, clientId: true, professional: { select: { userId: true } } },
    });

    if (expiredSessions.length > 0) {
      await prisma.session.updateMany({
        where: { id: { in: expiredSessions.map((s) => s.id) } },
        data: { status: "CANCELLED", cancelledAt: now, cancelledBy: "system" },
      });

      await prisma.notification.createMany({
        data: expiredSessions.flatMap((s) => [
          { userId: s.clientId, type: "SESSION_CANCELLED" as const, title: "Sesión cancelada", message: "Tu sesión pendiente ha sido cancelada automáticamente por inactividad.", link: "/dashboard/client" },
          { userId: s.professional.userId, type: "SESSION_CANCELLED" as const, title: "Sesión cancelada", message: "Una sesión pendiente ha sido cancelada automáticamente por inactividad.", link: "/dashboard/professional" },
        ]),
      });
    }

    // 2. Complete CONFIRMED sessions past due by 4+ hours so clients can leave reviews
    const pastDueCutoff = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const pastDueSessions = await prisma.session.findMany({
      where: { status: "CONFIRMED", scheduledAt: { lt: pastDueCutoff } },
      select: { id: true, clientId: true, professional: { select: { userId: true } } },
    });

    if (pastDueSessions.length > 0) {
      await prisma.session.updateMany({
        where: { id: { in: pastDueSessions.map((s) => s.id) } },
        data: { status: "COMPLETED" },
      });

      await prisma.notification.createMany({
        data: pastDueSessions.flatMap((s) => [
          { userId: s.clientId, type: "SESSION_COMPLETED" as const, title: "Sesión completada", message: "Tu sesión ha finalizado. ¡Deja tu valoración al profesional!", link: "/dashboard/client" },
          { userId: s.professional.userId, type: "SESSION_COMPLETED" as const, title: "Sesión completada", message: "Una sesión ha sido marcada como completada automáticamente.", link: "/dashboard/professional" },
        ]),
      });
    }

    const expiredCancelled = expiredSessions.length;
    const pastDueCompleted = pastDueSessions.length;

    logger.info("Session cleanup completed", { expiredCancelled, pastDueCompleted });

    return NextResponse.json({ success: true, expiredCancelled, pastDueCompleted });
  } catch (error) {
    logger.error("Session cleanup failed", { error: String(error) });
    return NextResponse.json({ error: "Error en limpieza de sesiones" }, { status: 500 });
  }
}
