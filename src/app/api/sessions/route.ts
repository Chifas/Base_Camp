import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/sessions — returns sessions for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") ?? "client"; // "client" | "professional"

    if (role === "professional") {
      // Find the professional profile for this user
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
          client: { select: { id: true, name: true, image: true } },
          review: true,
        },
        orderBy: { scheduledAt: "asc" },
      });

      return NextResponse.json(sessions);
    }

    // CLIENT view
    const sessions = await prisma.session.findMany({
      where: { clientId: session.user.id },
      include: {
        professional: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        review: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener sesiones" },
      { status: 500 }
    );
  }
}

// POST /api/sessions — book a new session
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { professionalId, scheduledAt, duration = 60, notes } = await req.json();

    if (!professionalId || !scheduledAt) {
      return NextResponse.json(
        { error: "professionalId y scheduledAt son obligatorios" },
        { status: 400 }
      );
    }

    // Fetch price from the professional profile
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: { hourlyRate: true, userId: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Prevent booking yourself
    if (profile.userId === session.user.id) {
      return NextResponse.json(
        { error: "No puedes reservar una sesión contigo mismo" },
        { status: 400 }
      );
    }

    // Check for slot conflicts (same professional, same time)
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

    const newSession = await prisma.session.create({
      data: {
        clientId: session.user.id,
        professionalId,
        scheduledAt: new Date(scheduledAt),
        duration,
        price: profile.hourlyRate,
        status: "PENDING",
        // notes stored as part of the session (could add a notes field to schema later)
      },
      include: {
        professional: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear la sesión" },
      { status: 500 }
    );
  }
}
