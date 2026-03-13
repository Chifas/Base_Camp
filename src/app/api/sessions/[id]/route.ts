import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmails } from "@/lib/emails";

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

    const { status } = await req.json();
    const allowed = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

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

    // Only the professional can confirm; either party can cancel
    if (status === "CONFIRMED" && !isProfessional) {
      return NextResponse.json(
        { error: "Solo el profesional puede confirmar sesiones" },
        { status: 403 }
      );
    }

    const updated = await prisma.session.update({
      where: { id: params.id },
      data:  { status },
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
