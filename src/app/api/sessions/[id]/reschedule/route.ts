import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rescheduleRequestSchema, rescheduleResponseSchema } from "@/lib/validations";
import { createNotifications } from "@/lib/notifications";

/**
 * POST /api/sessions/[id]/reschedule — propose a new date/time.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = rescheduleRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const proposedAt = new Date(parsed.data.proposedAt);
    if (proposedAt <= new Date()) {
      return NextResponse.json(
        { error: "La fecha propuesta debe ser en el futuro" },
        { status: 400 }
      );
    }

    const dbSession = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        professional: {
          include: { user: { select: { id: true, name: true } } },
        },
        client: { select: { id: true, name: true } },
      },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const isClient = dbSession.clientId === session.user.id;
    const isProfessional = dbSession.professional.userId === session.user.id;

    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    if (dbSession.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Solo se pueden reprogramar sesiones confirmadas" },
        { status: 400 }
      );
    }

    // Check for existing pending reschedule
    const existingPending = await prisma.rescheduleRequest.findFirst({
      where: { sessionId: params.id, status: "PENDING" },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: "Ya hay una propuesta de reprogramación pendiente" },
        { status: 409 }
      );
    }

    const reschedule = await prisma.rescheduleRequest.create({
      data: {
        sessionId: params.id,
        proposedBy: session.user.id,
        proposedAt,
      },
    });

    // Notify the other party
    const otherUserId = isClient
      ? dbSession.professional.userId
      : dbSession.clientId;
    const proposerName = isClient
      ? (dbSession.client.name ?? "Tu cliente")
      : (dbSession.professional.user.name ?? "Tu profesional");

    void createNotifications([
      {
        userId: otherUserId,
        type: "SESSION_CONFIRMED", // Reuse type for reschedule proposals
        title: "Propuesta de reprogramación",
        message: `${proposerName} propone cambiar la sesión al ${proposedAt.toLocaleDateString("es-ES")}.`,
        link: isClient ? "/dashboard/professional" : "/dashboard/client",
      },
    ]);

    return NextResponse.json(reschedule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear propuesta de reprogramación" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions/[id]/reschedule — accept or reject a proposal.
 */
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
    const parsed = rescheduleResponseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Find the pending reschedule request
    const reschedule = await prisma.rescheduleRequest.findFirst({
      where: { sessionId: params.id, status: "PENDING" },
      include: {
        session: {
          include: {
            professional: {
              include: { user: { select: { id: true, name: true } } },
            },
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!reschedule) {
      return NextResponse.json(
        { error: "No hay propuesta de reprogramación pendiente" },
        { status: 404 }
      );
    }

    // Only the OTHER party (not the proposer) can respond
    if (reschedule.proposedBy === session.user.id) {
      return NextResponse.json(
        { error: "No puedes responder a tu propia propuesta" },
        { status: 403 }
      );
    }

    // Check that responder is actually a participant
    const isClient = reschedule.session.clientId === session.user.id;
    const isProfessional = reschedule.session.professional.userId === session.user.id;
    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    // Update the reschedule request
    const updated = await prisma.rescheduleRequest.update({
      where: { id: reschedule.id },
      data: { status, respondedAt: new Date() },
    });

    if (status === "ACCEPTED") {
      // Update the session with the new time
      await prisma.session.update({
        where: { id: params.id },
        data: {
          scheduledAt: reschedule.proposedAt,
          reminderSent: false, // Reset reminder for new time
        },
      });
    }

    // Notify the proposer
    const responderName = isClient
      ? (reschedule.session.client.name ?? "Tu cliente")
      : (reschedule.session.professional.user.name ?? "Tu profesional");

    void createNotifications([
      {
        userId: reschedule.proposedBy,
        type: "SESSION_CONFIRMED",
        title: status === "ACCEPTED"
          ? "Reprogramación aceptada"
          : "Reprogramación rechazada",
        message: status === "ACCEPTED"
          ? `${responderName} ha aceptado el cambio de fecha.`
          : `${responderName} ha rechazado el cambio de fecha.`,
        link: isClient ? "/dashboard/professional" : "/dashboard/client",
      },
    ]);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al responder a la reprogramación" },
      { status: 500 }
    );
  }
}
