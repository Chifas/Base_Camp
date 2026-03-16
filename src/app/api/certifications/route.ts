import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { certificationSchema } from "@/lib/validations";

export async function GET() {
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
      return NextResponse.json([], { status: 200 });
    }

    const certifications = await prisma.certification.findMany({
      where: { professionalId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      certifications.map((c) => ({
        id: c.id,
        title: c.title,
        institution: c.institution,
        year: c.year,
      }))
    );
  } catch (error) {
    console.error("[/api/certifications GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const parsed = certificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const certification = await prisma.certification.create({
      data: {
        professionalId: profile.id,
        title: parsed.data.title,
        institution: parsed.data.institution,
        year: parsed.data.year,
      },
    });

    return NextResponse.json({
      id: certification.id,
      title: certification.title,
      institution: certification.institution,
      year: certification.year,
    }, { status: 201 });
  } catch (error) {
    console.error("[/api/certifications POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
