import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  completed: z.boolean(),
});

/** PATCH /api/action-items/[id] — toggle completed (client of the session only) */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const item = await prisma.actionItem.findUnique({
    where: { id: params.id },
    include: {
      sessionNote: {
        include: { session: { select: { clientId: true } } },
      },
    },
  });
  if (!item) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  if (item.sessionNote.session.clientId !== auth.user.id) {
    return NextResponse.json({ error: "Solo el cliente puede marcar tareas" }, { status: 403 });
  }

  const updated = await prisma.actionItem.update({
    where: { id: params.id },
    data:  { completed: parsed.data.completed },
  });

  return NextResponse.json({ item: updated });
}
