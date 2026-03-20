import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

/**
 * GET /api/messages?sessionId=xxx&limit=50&before=cursorId
 * Returns messages for a session (only participants can access).
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const before = url.searchParams.get("before"); // cursor for pagination

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId es obligatorio" }, { status: 400 });
  }

  try {
    // Verify user is participant
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { clientId: true, professionalId: true, professional: { select: { userId: true } } },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const isParticipant =
      dbSession.clientId === session.user.id ||
      dbSession.professional.userId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "No tienes acceso a esta conversación" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        sessionId,
        ...(before ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: before } }))?.createdAt } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Mark unread messages from the other user as read
    await prisma.message.updateMany({
      where: {
        sessionId,
        userId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({
      messages: messages.reverse(), // oldest first
      hasMore: messages.length === limit,
    });
  } catch (error) {
    logger.error("Error fetching messages", { error: String(error) });
    return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 });
  }
}

/**
 * POST /api/messages — send a message in a session.
 * Body: { sessionId, content, type?, fileUrl?, fileName? }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sessionId, content, type = "text", fileUrl, fileName } = body;

    if (!sessionId || !content?.trim()) {
      return NextResponse.json({ error: "sessionId y content son obligatorios" }, { status: 400 });
    }

    // Verify user is participant
    const dbSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        clientId: true,
        professionalId: true,
        status: true,
        professional: { select: { userId: true, user: { select: { name: true } } } },
        client: { select: { name: true } },
      },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    const isClient = dbSession.clientId === session.user.id;
    const isProfessional = dbSession.professional.userId === session.user.id;

    if (!isClient && !isProfessional) {
      return NextResponse.json({ error: "No tienes acceso a esta conversación" }, { status: 403 });
    }

    // Only allow messaging for confirmed or completed sessions
    if (!["CONFIRMED", "COMPLETED"].includes(dbSession.status)) {
      return NextResponse.json(
        { error: "Solo puedes enviar mensajes en sesiones confirmadas o completadas" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        sessionId,
        userId: session.user.id,
        content: stripHtml(content.trim()),
        type,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Send notification to the other participant (fire-and-forget)
    const { createNotification } = await import("@/lib/notifications");
    const recipientId = isClient ? dbSession.professional.userId : dbSession.clientId;
    const senderName = isClient ? dbSession.client.name : dbSession.professional.user.name;

    void createNotification({
      userId: recipientId,
      type: "SESSION_CONFIRMED" as const, // reusing type since we don't have a CHAT type
      title: "Nuevo mensaje",
      message: `${senderName ?? "Alguien"} te ha enviado un mensaje`,
      link: `/dashboard/${isClient ? "professional" : "client"}`,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    logger.error("Error sending message", { error: String(error) });
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
