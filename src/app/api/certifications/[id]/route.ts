import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const certification = await prisma.certification.findUnique({
      where: { id: params.id },
    });

    if (!certification || certification.professionalId !== profile.id) {
      return NextResponse.json({ error: "Certificación no encontrada" }, { status: 404 });
    }

    await prisma.certification.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/certifications/[id] DELETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
