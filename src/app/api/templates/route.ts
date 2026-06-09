import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name:    z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
});

async function getProfessionalId(userId: string): Promise<string | null> {
  const profile = await prisma.professionalProfile.findUnique({
    where:  { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

/** GET /api/templates — list the professional's templates */
export async function GET() {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const professionalId = await getProfessionalId(auth.user.id);
  if (!professionalId) return NextResponse.json({ data: [] });

  const templates = await prisma.messageTemplate.findMany({
    where:   { professionalId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ data: templates });
}

/** POST /api/templates — create a new template */
export async function POST(req: Request) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const professionalId = await getProfessionalId(auth.user.id);
  if (!professionalId) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const template = await prisma.messageTemplate.create({
    data: { professionalId, name: parsed.data.name, content: parsed.data.content },
  });
  return NextResponse.json({ template });
}
