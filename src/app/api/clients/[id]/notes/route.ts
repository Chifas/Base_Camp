import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().max(5000),
});

async function getProAndVerifyClient(userId: string, clientId: string) {
  const profile = await prisma.professionalProfile.findUnique({
    where:  { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false as const, error: "Perfil no encontrado", status: 404 as const };

  // The client must have at least one session with this professional
  const hasSession = await prisma.session.findFirst({
    where:  { professionalId: profile.id, clientId },
    select: { id: true },
  });
  if (!hasSession) {
    return { ok: false as const, error: "Cliente no encontrado", status: 404 as const };
  }
  return { ok: true as const, professionalId: profile.id };
}

/** GET /api/clients/[id]/notes — get the private note about this client */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const access = await getProAndVerifyClient(auth.user.id, params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const note = await prisma.clientNote.findUnique({
    where: { professionalId_clientId: { professionalId: access.professionalId, clientId: params.id } },
  });
  return NextResponse.json({ note });
}

/** PUT /api/clients/[id]/notes — upsert the private note */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id || auth.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const access = await getProAndVerifyClient(auth.user.id, params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Empty content → delete the note
  if (parsed.data.content.trim().length === 0) {
    await prisma.clientNote.deleteMany({
      where: { professionalId: access.professionalId, clientId: params.id },
    });
    return NextResponse.json({ note: null });
  }

  const note = await prisma.clientNote.upsert({
    where:  { professionalId_clientId: { professionalId: access.professionalId, clientId: params.id } },
    create: { professionalId: access.professionalId, clientId: params.id, content: parsed.data.content },
    update: { content: parsed.data.content },
  });
  return NextResponse.json({ note });
}
