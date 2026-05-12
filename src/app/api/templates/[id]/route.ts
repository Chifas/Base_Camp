import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name:    z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(5000).optional(),
});

async function verifyOwnership(userId: string, templateId: string) {
  const template = await prisma.messageTemplate.findUnique({
    where:   { id: templateId },
    include: { professional: { select: { userId: true } } },
  });
  if (!template) return { ok: false as const, error: "Plantilla no encontrada", status: 404 as const };
  if (template.professional.userId !== userId) {
    return { ok: false as const, error: "No autorizado", status: 403 as const };
  }
  return { ok: true as const, template };
}

/** PUT /api/templates/[id] — update name/content */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const access = await verifyOwnership(auth.user.id, params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  const body   = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const data: { name?: string; content?: string } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.content !== undefined) data.content = parsed.data.content;

  const template = await prisma.messageTemplate.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ template });
}

/** DELETE /api/templates/[id] */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await getServerSession(authOptions);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const access = await verifyOwnership(auth.user.id, params.id);
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

  await prisma.messageTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
