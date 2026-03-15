import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/blocked-dates — return the authenticated professional's blocked dates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        blockedDates: { orderBy: { date: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    return NextResponse.json(profile.blockedDates);
  } catch {
    return NextResponse.json({ error: "Error al cargar fechas bloqueadas" }, { status: 500 });
  }
}

// POST /api/blocked-dates — block a date
// Body: { date: string (ISO), reason?: string }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { date, reason } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "date es obligatorio" }, { status: 400 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    const blocked = await prisma.blockedDate.create({
      data: {
        professionalId: profile.id,
        date: new Date(date),
        reason: reason?.trim() || null,
      },
    });

    return NextResponse.json(blocked, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al bloquear fecha" }, { status: 500 });
  }
}

// DELETE /api/blocked-dates — unblock a date
// Body: { id: string }
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id es obligatorio" }, { status: 400 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil profesional no encontrado" }, { status: 404 });
    }

    await prisma.blockedDate.delete({
      where: { id, professionalId: profile.id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al desbloquear fecha" }, { status: 500 });
  }
}
