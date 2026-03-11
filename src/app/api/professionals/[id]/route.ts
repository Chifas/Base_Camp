import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        availability: { orderBy: { dayOfWeek: "asc" } },
        sessions: {
          where: { review: { isNot: null } },
          include: {
            review: true,
            client: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(professional);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}
