import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSessionReminderEmails } from "@/lib/emails";
import { createNotifications } from "@/lib/notifications";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/session-reminders
 *
 * Sends reminder emails + in-app notifications for sessions starting
 * within the next 75 minutes that haven't been reminded yet.
 *
 * Protected by CRON_SECRET header (set in Vercel Cron or external cron).
 */
export async function GET(req: Request) {
  // Verify cron secret — fail-closed if not configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    logger.error("CRON_SECRET not configured — rejecting request");
    return NextResponse.json({ error: "Configuración de seguridad faltante" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 75 * 60 * 1000); // now + 75 min

    const sessions = await prisma.session.findMany({
      where: {
        status: "CONFIRMED",
        reminderSent: false,
        scheduledAt: {
          gte: now,
          lte: windowEnd,
        },
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        professional: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    logger.info("Cron: session reminders", { found: sessions.length });

    for (const s of sessions) {
      // Send emails
      void sendSessionReminderEmails({
        id: s.id,
        scheduledAt: s.scheduledAt,
        price: s.price,
        client: s.client as { name: string | null; email: string },
        professional: s.professional as { user: { name: string | null; email: string } },
      });

      // Create in-app notifications
      void createNotifications([
        {
          userId: s.clientId,
          type: "SESSION_REMINDER",
          title: "Tu sesión es en 1 hora",
          message: `Tu sesión con ${s.professional.user.name ?? "tu profesional"} comienza pronto.`,
          link: `/session/${s.id}`,
        },
        {
          userId: s.professional.userId,
          type: "SESSION_REMINDER",
          title: "Tu sesión es en 1 hora",
          message: `Tu sesión con ${s.client.name ?? "tu cliente"} comienza pronto.`,
          link: `/session/${s.id}`,
        },
      ]);

      // Mark as reminded
      await prisma.session.update({
        where: { id: s.id },
        data: { reminderSent: true },
      });
    }

    return NextResponse.json({
      success: true,
      reminders: sessions.length,
    });
  } catch (error) {
    logger.error("Cron: error en session reminders", { error: String(error) });
    return NextResponse.json(
      { error: "Error procesando recordatorios" },
      { status: 500 }
    );
  }
}
