import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/availability — return the authenticated professional's availability
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where:   { userId: session.user.id },
      include: { availability: { orderBy: { dayOfWeek: "asc" } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    return NextResponse.json(profile.availability);
  } catch {
    return NextResponse.json({ error: "Error al cargar disponibilidad" }, { status: 500 });
  }
}

// PUT /api/availability — replace the professional's weekly availability slots
// Body: { slots: { dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }[] }
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { slots } = await req.json() as {
      slots: { dayOfWeek: number; startTime: string; endTime: string; enabled: boolean }[];
    };

    if (!Array.isArray(slots)) {
      return NextResponse.json({ error: "slots debe ser un array" }, { status: 400 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    // Keep only enabled days with valid times
    const enabled = slots.filter(
      (s) => s.enabled && s.startTime && s.endTime && s.startTime < s.endTime
    );

    // Atomic replace: delete all existing + create new ones in a transaction
    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { professionalId: profile.id } }),
      prisma.availability.createMany({
        data: enabled.map((s) => ({
          professionalId: profile.id,
          dayOfWeek:      s.dayOfWeek,
          startTime:      s.startTime,
          endTime:        s.endTime,
        })),
      }),
    ]);

    // Return the saved slots
    const saved = await prisma.availability.findMany({
      where:   { professionalId: profile.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Error al guardar disponibilidad" }, { status: 500 });
  }
}
