import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { sendBookingEmails, type EmailSessionData } from "@/lib/emails";
import { createNotifications } from "@/lib/notifications";
import { stripHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";
import { z } from "zod";

const bookSessionSchema = z.object({
  professionalId: z.string().min(1, "professionalId es obligatorio"),
  scheduledAt: z.string().min(1, "scheduledAt es obligatorio").refine(
    (val) => !isNaN(new Date(val).getTime()),
    "scheduledAt debe ser una fecha válida"
  ),
  duration: z.number().int().min(15).max(180).default(60),
  notes: z.string().max(5000).optional(),
});

/**
 * POST /api/credits/use — book a free session using credits.
 * Replaces Stripe PaymentIntent flow for free-tier users.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input with Zod
    const parsed = bookSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { professionalId: validProfId, scheduledAt: validScheduledAt, duration: validDuration, notes: validNotes } = parsed.data;

    // Reject past dates before hitting the DB
    if (new Date(validScheduledAt) <= new Date()) {
      return NextResponse.json(
        { error: "No puedes reservar en una fecha u hora que ya ha pasado" },
        { status: 400 }
      );
    }

    // Fetch professional (outside transaction — read-only)
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: validProfId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
    }

    if (profile.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes reservar una sesión contigo mismo" },
        { status: 400 }
      );
    }

    // === Atomic transaction: credit check + deduction + session creation ===
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const requestedDate = new Date(validScheduledAt);
    const dateOnly = new Date(requestedDate.getFullYear(), requestedDate.getMonth(), requestedDate.getDate());
    const sessionEnd = new Date(requestedDate.getTime() + validDuration * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user and check credits (inside transaction for consistency)
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { freeCreditsUsed: true, creditsResetAt: true, name: true, email: true },
      });

      if (!user) throw new Error("USER_NOT_FOUND");

      // Auto-reset credits if month changed
      const resetAt = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
      let currentUsed = user.freeCreditsUsed;

      if (!resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()) {
        currentUsed = 0;
      }

      // Check credits available
      if (currentUsed >= CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH) {
        throw new Error("CREDITS_EXHAUSTED");
      }

      // 2. Anti-abuse: max 1 free session per client-professional pair per month
      const existingWithProfessional = await tx.session.findFirst({
        where: {
          clientId: session.user.id,
          professionalId: validProfId,
          isFreeSession: true,
          status: { in: ["CONFIRMED", "COMPLETED"] },
          scheduledAt: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      if (existingWithProfessional) throw new Error("DUPLICATE_BOOKING");

      // 3. Check blocked date
      const isBlocked = await tx.blockedDate.findFirst({
        where: { professionalId: validProfId, date: dateOnly },
      });

      if (isBlocked) throw new Error("DATE_BLOCKED");

      // 4. Duration-aware scheduling conflict check — professional side
      const conflict = await tx.session.findFirst({
        where: {
          professionalId: validProfId,
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [
            { scheduledAt: { lt: sessionEnd } },
            {
              scheduledAt: {
                gte: new Date(requestedDate.getTime() - validDuration * 60 * 1000),
              },
            },
          ],
        },
      });

      if (conflict) throw new Error("SCHEDULE_CONFLICT");

      // 5. Client-side scheduling conflict check — prevent double-booking for the client
      const clientConflict = await tx.session.findFirst({
        where: {
          clientId: session.user.id,
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [
            { scheduledAt: { lt: sessionEnd } },
            {
              scheduledAt: {
                gte: new Date(requestedDate.getTime() - validDuration * 60 * 1000),
              },
            },
          ],
        },
      });

      if (clientConflict) throw new Error("CLIENT_CONFLICT");

      // 6. Create session + deduct credit atomically
      const dbSession = await tx.session.create({
        data: {
          clientId: session.user.id,
          professionalId: validProfId,
          scheduledAt: requestedDate,
          duration: validDuration,
          price: 0,
          isFreeSession: true,
          status: "CONFIRMED",
          notes: validNotes ? stripHtml(validNotes) : null,
        },
      });

      // Only stamp creditsResetAt when starting a fresh month — never overwrite it with null
      const needsResetStamp = !resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear();
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          freeCreditsUsed: currentUsed + 1,
          ...(needsResetStamp ? { creditsResetAt: now } : {}),
        },
      });

      return {
        dbSession,
        user,
        creditsRemaining: CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH - (currentUsed + 1),
      };
    });

    const { dbSession, user, creditsRemaining } = result;

    logger.info("Free session booked", {
      sessionId: dbSession.id,
      userId: session.user.id,
      creditsRemaining,
    });

    // Send confirmation emails (fire-and-forget)
    const emailData: EmailSessionData = {
      id: dbSession.id,
      scheduledAt: dbSession.scheduledAt,
      price: 0,
      client: { name: user.name, email: user.email },
      professional: { user: { name: profile.user.name, email: profile.user.email } },
    };
    void sendBookingEmails(emailData);

    // In-app notifications
    void createNotifications([
      {
        userId: session.user.id,
        type: "SESSION_CONFIRMED" as const,
        title: "Sesión confirmada",
        message: `Tu sesión con ${profile.user.name ?? "tu profesional"} ha sido confirmada.`,
        link: "/dashboard/client",
      },
      {
        userId: profile.userId,
        type: "SESSION_CONFIRMED" as const,
        title: "Nueva sesión confirmada",
        message: `Tienes una nueva sesión con ${user.name ?? "un cliente"}.`,
        link: "/dashboard/professional",
      },
    ]);

    return NextResponse.json({
      sessionId: dbSession.id,
      creditsRemaining,
      status: "CONFIRMED",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    // Map transaction errors to user-facing responses
    const txErrors: Record<string, { error: string; status: number }> = {
      USER_NOT_FOUND: { error: "Usuario no encontrado", status: 404 },
      CREDITS_EXHAUSTED: { error: "Has agotado tus sesiones gratuitas este mes", status: 403 },
      DUPLICATE_BOOKING: { error: "Solo puedes reservar una sesión gratuita al mes con el mismo profesional", status: 429 },
      DATE_BLOCKED: { error: "El profesional no está disponible en esta fecha", status: 409 },
      SCHEDULE_CONFLICT: { error: "Este horario ya no está disponible", status: 409 },
      CLIENT_CONFLICT: { error: "Ya tienes una sesión programada en ese horario", status: 409 },
    };

    if (txErrors[msg]) {
      return NextResponse.json({ error: txErrors[msg].error }, { status: txErrors[msg].status });
    }

    logger.error("Error booking free session", { error: msg });
    return NextResponse.json(
      { error: "Error al reservar la sesión" },
      { status: 500 }
    );
  }
}
