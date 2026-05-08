import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const noteSchema = z.object({
  summary:   z.string().max(2000).optional().nullable(),
  nextSteps: z.string().max(2000).optional().nullable(),
  resources: z.array(z.string().url().max(500)).max(20).optional(),
  actionItems: z
    .array(
      z.object({
        id: z.string().optional(),
        content: z.string().min(1).max(500),
        completed: z.boolean().optional(),
        order: z.number().int().optional(),
      })
    )
    .max(20)
    .optional(),
});

type SessionAccess =
  | { ok: false; error: string; status: 404 | 403 }
  | { ok: true;  isClient: boolean; isProfessional: boolean };

async function getAuthorizedSession(sessionId: string, userId: string): Promise<SessionAccess> {
  const dbSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { professional: { select: { userId: true } } },
  });
  if (!dbSession) return { ok: false, error: "Sesión no encontrada", status: 404 };

  const isClient       = dbSession.clientId === userId;
  const isProfessional = dbSession.professional.userId === userId;
  if (!isClient && !isProfessional) {
    return { ok: false, error: "No autorizado", status: 403 };
  }
  return { ok: true, isClient, isProfessional };
}

/** GET /api/sessions/[id]/notes — read notes (both parties) */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const access = await getAuthorizedSession(params.id, auth.user.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const note = await prisma.sessionNote.findUnique({
    where: { sessionId: params.id },
    include: { actionItems: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ note });
}

/** PUT /api/sessions/[id]/notes — only the professional can write */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const access = await getAuthorizedSession(params.id, auth.user.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  if (!access.isProfessional) {
    return NextResponse.json({ error: "Solo el profesional puede editar las notas" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const note = await prisma.$transaction(async (tx) => {
      const upserted = await tx.sessionNote.upsert({
        where:  { sessionId: params.id },
        create: {
          sessionId: params.id,
          summary:   data.summary   ?? null,
          nextSteps: data.nextSteps ?? null,
          resources: data.resources ?? [],
        },
        update: {
          summary:   data.summary   ?? null,
          nextSteps: data.nextSteps ?? null,
          resources: data.resources ?? [],
        },
      });

      if (data.actionItems) {
        // Replace strategy: delete all existing items for this note, recreate them.
        // Keeps the API idempotent and the UI simple (no per-item reordering).
        await tx.actionItem.deleteMany({ where: { sessionNoteId: upserted.id } });
        if (data.actionItems.length > 0) {
          await tx.actionItem.createMany({
            data: data.actionItems.map((item, idx) => ({
              sessionNoteId: upserted.id,
              content:       item.content,
              completed:     item.completed ?? false,
              order:         item.order ?? idx,
            })),
          });
        }
      }

      return tx.sessionNote.findUnique({
        where: { id: upserted.id },
        include: { actionItems: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ note });
  } catch (error) {
    logger.error("Error guardando notas de sesión", { sessionId: params.id, error: String(error) });
    return NextResponse.json({ error: "Error al guardar las notas" }, { status: 500 });
  }
}
