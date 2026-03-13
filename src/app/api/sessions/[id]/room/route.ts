import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDailyRoom } from "@/lib/daily";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const dbSession = await prisma.session.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, image: true } },
        professional: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!dbSession) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // Verify user is a participant
    const userId = session.user.id;
    const isClient = dbSession.clientId === userId;
    const isProfessional = dbSession.professional.userId === userId;

    if (!isClient && !isProfessional) {
      return NextResponse.json(
        { error: "No tienes acceso a esta sesión" },
        { status: 403 }
      );
    }

    if (dbSession.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "La sesión no está confirmada" },
        { status: 400 }
      );
    }

    // If room already exists, return it
    let roomUrl = dbSession.dailyRoomUrl;

    // If no room yet, create one
    if (!roomUrl) {
      const expiresAt = new Date(dbSession.scheduledAt);
      expiresAt.setMinutes(expiresAt.getMinutes() + dbSession.duration);

      const room = await createDailyRoom(dbSession.id, expiresAt);
      roomUrl = room.url;

      // Save room URL to DB
      await prisma.session.update({
        where: { id: dbSession.id },
        data: { dailyRoomUrl: roomUrl },
      });
    }

    return NextResponse.json({
      url: roomUrl,
      session: {
        id: dbSession.id,
        professionalName: dbSession.professional.user.name ?? "Profesional",
        professionalImage: dbSession.professional.user.image ?? "",
        clientName: dbSession.client.name ?? "Cliente",
        clientImage: dbSession.client.image ?? "",
        scheduledAt: dbSession.scheduledAt.toISOString(),
        duration: dbSession.duration,
      },
    });
  } catch (error) {
    console.error("[/api/sessions/room]", error);
    return NextResponse.json(
      { error: "Error al obtener la sala de videollamada" },
      { status: 500 }
    );
  }
}
