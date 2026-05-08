import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
  npsScore: z.number().int().min(0).max(10),
  comment:  z.string().max(500).optional().nullable(),
});

/**
 * POST /api/sessions/[id]/feedback
 * Either party can submit one NPS rating per session.
 * Idempotent — re-submission overwrites the previous one.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body   = await req.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const dbSession = await prisma.session.findUnique({
    where:  { id: params.id },
    select: {
      clientId: true,
      professional: { select: { userId: true } },
    },
  });
  if (!dbSession) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  const isParticipant =
    dbSession.clientId === auth.user.id ||
    dbSession.professional.userId === auth.user.id;
  if (!isParticipant) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const feedback = await prisma.sessionFeedback.upsert({
    where:  { sessionId_userId: { sessionId: params.id, userId: auth.user.id } },
    create: {
      sessionId: params.id,
      userId:    auth.user.id,
      npsScore:  parsed.data.npsScore,
      comment:   parsed.data.comment ?? null,
    },
    update: {
      npsScore: parsed.data.npsScore,
      comment:  parsed.data.comment ?? null,
    },
  });

  return NextResponse.json({ feedback });
}
