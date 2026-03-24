import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/update-role
 * Only allowed for new accounts (created within the last 10 minutes)
 * during the OAuth complete-profile flow. Prevents arbitrary role escalation.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { role } = await req.json();
    if (role !== "CLIENT" && role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Only allow role change for recently created accounts (OAuth flow)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const ageInMinutes = (Date.now() - new Date(user.createdAt).getTime()) / 1000 / 60;
    if (ageInMinutes > 10) {
      return NextResponse.json(
        { error: "El rol solo se puede establecer durante el registro" },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[update-role]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
