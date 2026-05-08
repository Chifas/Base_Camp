import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSessionFollowupEmail } from "@/lib/emails";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/session-followup
 *
 * For each completed session whose scheduledAt was 36–96 hours ago and
 * which hasn't received a follow-up email yet, send one with the
 * professional's notes (if any) and a CTA to re-book.
 *
 * Marks `followupSent: true` after sending to prevent duplicates.
 * Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
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
    // 36h ago — give the professional some time to add notes after the session
    const windowStart = new Date(now.getTime() - 96 * 60 * 60 * 1000);
    const windowEnd   = new Date(now.getTime() - 36 * 60 * 60 * 1000);

    const sessions = await prisma.session.findMany({
      where: {
        status: { in: ["COMPLETED", "CONFIRMED"] },
        followupSent: false,
        scheduledAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        client:       { select: { id: true, name: true, email: true } },
        professional: {
          select: {
            id: true,
            user: { select: { name: true } },
          },
        },
        note: { include: { actionItems: { orderBy: { order: "asc" } } } },
      },
      take: 200,
    });

    logger.info("Cron: session followup", { found: sessions.length });

    for (const s of sessions) {
      try {
        await sendSessionFollowupEmail({
          clientEmail:      s.client.email,
          clientName:       s.client.name ?? "",
          professionalName: s.professional.user.name ?? "tu profesional",
          professionalId:   s.professional.id,
          sessionId:        s.id,
          summary:          s.note?.summary ?? null,
          nextSteps:        s.note?.nextSteps ?? null,
          actionItems:      s.note?.actionItems.map((a) => a.content) ?? [],
        });

        await prisma.session.update({
          where: { id: s.id },
          data:  { followupSent: true },
        });
      } catch (error) {
        logger.error("Cron: error processing session followup", {
          sessionId: s.id,
          error: String(error),
        });
      }
    }

    return NextResponse.json({ success: true, sent: sessions.length });
  } catch (error) {
    logger.error("Cron: error en session followup", { error: String(error) });
    return NextResponse.json({ error: "Error procesando seguimientos" }, { status: 500 });
  }
}
