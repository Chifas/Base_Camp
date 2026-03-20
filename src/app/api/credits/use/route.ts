import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { sendBookingEmails, type EmailSessionData } from "@/lib/emails";
import { createNotifications } from "@/lib/notifications";
import { stripHtml } from "@/lib/sanitize";
import { log } from "@/lib/logger";

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
    const { professionalId, scheduledAt, duration = 60, notes } = body;

    if (!professionalId || !scheduledAt) {
      return NextResponse.json(
        { error: "professionalId y scheduledAt son obligatorios" },
        { status: 400 }
      );
    }

    // Fetch user to check credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { freeCreditsUsed: true, creditsResetAt: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Auto-reset credits if month changed
    const now = new Date();
    const resetAt = user.creditsResetAt ? new Date(user.creditsResetAt) : null;
    let currentUsed = user.freeCreditsUsed;

    if (!resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()) {
      currentUsed = 0;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { freeCreditsUsed: 0, creditsResetAt: now },
      });
    }

    // Check credits available
    if (currentUsed >= CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH) {
      return NextResponse.json(
        { error: "Has agotado tus sesiones gratuitas este mes", creditsRemaining: 0 },
        { status: 403 }
      );
    }

    // Fetch professional
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
    }

    // Prevent booking yourself
    if (profile.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes reservar una sesión contigo mismo" },
        { status: 400 }
      );
    }

    // Check scheduling conflicts
    const conflict = await prisma.session.findFirst({
      where: {
        professionalId,
        scheduledAt: new Date(scheduledAt),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible" },
        { status: 409 }
      );
    }

    // Create session (CONFIRMED directly — no payment needed)
    const dbSession = await prisma.session.create({
      data: {
        clientId: session.user.id,
        professionalId,
        scheduledAt: new Date(scheduledAt),
        duration,
        price: 0,
        isFreeSession: true,
        status: "CONFIRMED",
        notes: notes ? stripHtml(notes) : null,
      },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: session.user.id },
      data: { freeCreditsUsed: currentUsed + 1 },
    });

    const creditsRemaining = CREDITS_CONFIG.FREE_SESSIONS_PER_MONTH - (currentUsed + 1);

    log.info("Free session booked", {
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
    log.error("Error booking free session", { error: String(error) });
    return NextResponse.json(
      { error: "Error al reservar la sesión" },
      { status: 500 }
    );
  }
}
