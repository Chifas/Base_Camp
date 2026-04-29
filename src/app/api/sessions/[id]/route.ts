import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendCancellationEmails } from "@/lib/emails";
import { updateSessionSchema } from "@/lib/validations";
import { stripHtml } from "@/lib/sanitize";
import { calculateCancellation } from "@/lib/cancellation";
import { createNotifications } from "@/lib/notifications";
import { CREDITS_CONFIG } from "@/lib/credits-config";
import { logger } from "@/lib/logger";

// GET /api/sessions/[id] — load a single session for participants only
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const dbSession = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        professional: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        client: { select: { id: true, name: true, image: true } },
      },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const isClient       = dbSession.clientId === session.user.id;
    const isProfessional = dbSession.professional.userId === session.user.id;

    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    return NextResponse.json({
      ...dbSession,
      role: isClient ? "client" : "professional",
    });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] — update status or notes
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { status, notes: rawNotes } = parsed.data;
    const notes = rawNotes ? stripHtml(rawNotes) : rawNotes;

    // Load full session with participants
    const existing = await prisma.session.findUnique({
      where:   { id: params.id },
      include: {
        professional: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        client: { select: { id: true, name: true, email: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const isClient       = existing.clientId === session.user.id;
    const isProfessional = existing.professional.userId === session.user.id;

    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // ── Handle notes update (no status change) ────────────────────────────
    if (notes !== undefined && !status) {
      if (!isProfessional) {
        return NextResponse.json(
          { error: "Solo el profesional puede añadir notas" },
          { status: 403 }
        );
      }
      if (existing.status !== "COMPLETED") {
        return NextResponse.json(
          { error: "Solo puedes añadir notas a sesiones completadas" },
          { status: 400 }
        );
      }
      const updated = await prisma.session.update({
        where: { id: params.id },
        data: { notes },
      });
      return NextResponse.json(updated);
    }

    // ── Handle status change ──────────────────────────────────────────────
    if (!status) {
      return NextResponse.json({ error: "status es obligatorio" }, { status: 400 });
    }

    // Only the professional can confirm or complete
    if (status === "CONFIRMED" && !isProfessional) {
      return NextResponse.json(
        { error: "Solo el profesional puede confirmar sesiones" },
        { status: 403 }
      );
    }
    if (status === "COMPLETED" && !isProfessional) {
      return NextResponse.json(
        { error: "Solo el profesional puede completar sesiones" },
        { status: 403 }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING:   ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${existing.status} a ${status}` },
        { status: 400 }
      );
    }

    // ── Cancellation with policy ──────────────────────────────────────────
    if (status === "CANCELLED") {
      const cancellation = calculateCancellation({
        scheduledAt: existing.scheduledAt,
        price: existing.price,
        cancelledByRole: isProfessional ? "PROFESSIONAL" : "CLIENT",
      });

      const updateData: Record<string, unknown> = {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
        cancellationFee: cancellation.cancellationFee,
      };

      // Process Stripe refund if payment exists
      if (stripe && existing.stripePaymentIntentId) {
        try {
          if (cancellation.refundAmount > 0) {
            const refundAmountCents = Math.round(cancellation.refundAmount * 100);
            await stripe.refunds.create({
              payment_intent: existing.stripePaymentIntentId,
              amount: refundAmountCents,
            });
            logger.info("Refund procesado", {
              sessionId: existing.id,
              amount: cancellation.refundAmount,
              fee: cancellation.cancellationFee,
            });
          }
        } catch (error) {
          logger.error("Error procesando refund", { error: String(error), sessionId: existing.id });
          // Don't block the cancellation — refund can be done manually
        }
      }

      const updated = await prisma.session.update({
        where: { id: params.id },
        data: updateData,
      });

      // Fire-and-forget emails + notifications
      void sendCancellationEmails({
        id:           existing.id,
        scheduledAt:  existing.scheduledAt,
        price:        existing.price,
        client:       existing.client as { name: string | null; email: string },
        professional: existing.professional as { user: { name: string | null; email: string } },
      });

      const otherUserId = isProfessional ? existing.clientId : existing.professional.userId;
      void createNotifications([
        {
          userId: otherUserId,
          type: "SESSION_CANCELLED",
          title: "Sesión cancelada",
          message: `Tu sesión del ${existing.scheduledAt.toLocaleDateString("es-ES")} ha sido cancelada.${
            cancellation.cancellationFee > 0
              ? ` Cargo por cancelación tardía: ${cancellation.cancellationFee.toFixed(2)}€.`
              : ""
          }`,
          link: isProfessional ? "/dashboard/client" : "/dashboard/professional",
        },
      ]);

      return NextResponse.json({
        ...updated,
        cancellation: {
          refundAmount: cancellation.refundAmount,
          cancellationFee: cancellation.cancellationFee,
          isFree: cancellation.isFree,
        },
      });
    }

    // ── Completion with impact points ──────────────────────────────────────
    if (status === "COMPLETED") {
      const updateData: Record<string, unknown> = { status: "COMPLETED" };

      // Award impact points to professional
      const pointsToAward = CREDITS_CONFIG.IMPACT_POINTS_PER_SESSION;
      try {
        const updatedProfile = await prisma.professionalProfile.update({
          where: { id: existing.professionalId },
          data: {
            impactPoints: { increment: pointsToAward },
            totalSessionsCompleted: { increment: 1 },
            socialImpactScore: {
              increment: pointsToAward * 0.1,
            },
          },
        });

        logger.info("Impact points awarded", {
          sessionId: existing.id,
          professionalId: existing.professionalId,
          pointsAwarded: pointsToAward,
          totalPoints: updatedProfile.impactPoints,
        });

        // Notify professional about impact points
        void createNotifications([
          {
            userId: existing.professional.userId,
            type: "PAYMENT_RECEIVED",
            title: "Puntos de impacto ganados",
            message: `Has ganado ${pointsToAward} puntos de impacto por tu sesión completada. Total: ${updatedProfile.impactPoints} puntos.`,
            link: "/dashboard/professional?tab=impact",
          },
        ]);
      } catch (error) {
        logger.error("Error awarding impact points", { error: String(error), sessionId: existing.id });
      }

      // For paid sessions, still handle Stripe transfer
      if (
        !existing.isFreeSession &&
        stripe &&
        existing.stripePaymentIntentId &&
        existing.professional.stripeAccountId &&
        existing.professional.stripeConnected
      ) {
        try {
          const transferAmountCents = Math.round(existing.price * 0.85 * 100);
          const transfer = await stripe.transfers.create({
            amount: transferAmountCents,
            currency: "eur",
            destination: existing.professional.stripeAccountId,
            transfer_group: existing.id,
            description: `Sesión ${existing.id}`,
          });
          updateData.stripeTransferId = transfer.id;
        } catch (error) {
          logger.error("Error creando transfer", { error: String(error), sessionId: existing.id });
        }
      }

      const updated = await prisma.session.update({
        where: { id: params.id },
        data: updateData,
      });

      return NextResponse.json(updated);
    }

    // ── Other status changes (CONFIRMED) ──────────────────────────────────
    const updated = await prisma.session.update({
      where: { id: params.id },
      data: { status },
    });

    if (status === "CONFIRMED") {
      void createNotifications([
        {
          userId: existing.clientId,
          type: "SESSION_CONFIRMED",
          title: "Sesión confirmada",
          message: `Tu sesión del ${existing.scheduledAt.toLocaleDateString("es-ES")} ha sido confirmada.`,
          link: "/dashboard/client",
        },
      ]);
    }

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Error actualizando sesión", { error: String(error) });
    return NextResponse.json(
      { error: "Error al actualizar la sesión" },
      { status: 500 }
    );
  }
}
