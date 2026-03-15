import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmails } from "@/lib/emails";
import { updateSessionSchema } from "@/lib/validations";
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

// PATCH /api/sessions/[id] — update status (accept / reject)
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
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    // Verify the requesting user owns this session (as professional or client)
    // Include user emails so we can send notifications
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

    const updated = await prisma.session.update({
      where: { id: params.id },
      data:  { status },
    });

    logger.info("session.status_changed", {
      sessionId: params.id,
      from: existing.status,
      to: status,
      changedBy: isClient ? "client" : "professional",
      userId: session.user.id,
    });

    // Fire-and-forget email on cancellation
    if (status === "CANCELLED") {
      void sendCancellationEmails({
        id:           existing.id,
        scheduledAt:  existing.scheduledAt,
        price:        existing.price,
        client:       existing.client as { name: string | null; email: string },
        professional: existing.professional as {
          user: { name: string | null; email: string };
        },
      });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar la sesión" },
      { status: 500 }
    );
  }
}
