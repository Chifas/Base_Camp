import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * GET /api/blocked-dates — get blocked dates for the authenticated professional.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    const blockedDates = await prisma.blockedDate.findMany({
      where: { professionalId: profile.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ blockedDates });
  } catch (error) {
    logger.error("Error fetching blocked dates", { error: String(error) });
    return NextResponse.json({ error: "Error al obtener fechas bloqueadas" }, { status: 500 });
  }
}

/**
 * POST /api/blocked-dates — block a specific date.
 * Body: { date: "2026-04-15", reason?: "Vacaciones" }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ error: "La fecha es obligatoria" }, { status: 400 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    }

    // Don't allow blocking past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return NextResponse.json({ error: "No puedes bloquear fechas pasadas" }, { status: 400 });
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        professionalId: profile.id,
        date: parsedDate,
        reason: reason?.trim() || null,
      },
    });

    return NextResponse.json({ blockedDate }, { status: 201 });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2002") {
      return NextResponse.json({ error: "Esta fecha ya está bloqueada" }, { status: 409 });
    }
    logger.error("Error blocking date", { error: String(error) });
    return NextResponse.json({ error: "Error al bloquear fecha" }, { status: 500 });
  }
}

/**
 * DELETE /api/blocked-dates — unblock a specific date.
 * Body: { id: "cuid..." }
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    await prisma.blockedDate.delete({
      where: { id, professionalId: profile.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error unblocking date", { error: String(error) });
    return NextResponse.json({ error: "Error al desbloquear fecha" }, { status: 500 });
  }
}
