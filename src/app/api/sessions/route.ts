import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const role = session.user.role;

    if (role === "PROFESSIONAL") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil profesional no encontrado" },
          { status: 404 }
        );
      }

      const sessions = await prisma.session.findMany({
        where: { professionalId: profile.id },
        include: {
          client: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });

      const data = sessions.map((s) => ({
        id: s.id,
        clientId: s.clientId,
        professionalId: s.professionalId,
        clientName: s.client.name ?? "Cliente",
        clientImage: s.client.image ?? "",
        scheduledAt: s.scheduledAt.toISOString(),
        duration: s.duration,
        status: s.status,
        price: s.price,
        dailyRoomUrl: s.dailyRoomUrl,
      }));

      return NextResponse.json(data);
    }

    // CLIENT role
    const sessions = await prisma.session.findMany({
      where: { clientId: session.user.id },
      include: {
        professional: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const data = sessions.map((s) => ({
      id: s.id,
      clientId: s.clientId,
      professionalId: s.professionalId,
      professionalName: s.professional.user.name ?? "Profesional",
      professionalImage: s.professional.user.image ?? "",
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration,
      status: s.status,
      price: s.price,
      dailyRoomUrl: s.dailyRoomUrl,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/sessions]", error);
    return NextResponse.json(
      { error: "Error al obtener sesiones" },
      { status: 500 }
    );
  }
}
