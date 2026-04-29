import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { stripHtml } from "@/lib/sanitize";
import { z } from "zod";

const sendMessageSchema = z.object({
  content: z.string().min(1, "El mensaje no puede estar vacío").max(2000, "Máximo 2000 caracteres"),
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/conversations/[id]/messages — paginated messages for a conversation
// Query params: ?limit=50&before=<messageId>
// ────────────────────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const conversationId = params.id;
    const userId = session.user.id;

    // Fetch conversation and verify the user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        professional: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    const isClient = conversation.clientId === userId;
    const isProfessional = conversation.professional.userId === userId;

    if (!isClient && !isProfessional) {
      return NextResponse.json(
        { error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    // Parse pagination params
    const url = new URL(req.url);
    const limitParam = Number(url.searchParams.get("limit") ?? 50);
    const limit = Math.min(Math.max(limitParam, 1), 100);
    const before = url.searchParams.get("before");

    // Build cursor-based pagination — validate cursor belongs to this conversation
    let cursor: { id: string } | undefined;
    if (before) {
      const cursorMsg = await prisma.directMessage.findFirst({
        where: { id: before, conversationId },
        select: { id: true },
      });
      if (!cursorMsg) {
        return NextResponse.json(
          { error: "Cursor inválido" },
          { status: 400 }
        );
      }
      cursor = { id: before };
    }

    const messages = await prisma.directMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra to determine hasMore
      ...(cursor && { cursor, skip: 1 }),
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // remove the extra item
    }

    // Mark unread messages from the other user as read (fire-and-forget)
    void prisma.directMessage
      .updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          read: false,
        },
        data: { read: true },
      })
      .catch((err) => {
        logger.error("Error marcando mensajes como leídos", {
          conversationId,
          error: String(err),
        });
      });

    // Reverse so messages are returned in chronological order (oldest first)
    const chronological = messages.reverse();

    return NextResponse.json({
      messages: chronological.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderImage: m.sender.image,
        content: m.content,
        read: m.read,
        createdAt: m.createdAt.toISOString(),
      })),
      hasMore,
    });
  } catch (error) {
    logger.error("Error al obtener mensajes", {
      conversationId: params.id,
      error: String(error),
    });
    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/conversations/[id]/messages — send a message in a conversation
// Body: { content }
// ────────────────────────────────────────────────────────────────────────────

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const conversationId = params.id;
    const userId = session.user.id;

    // Fetch conversation and verify the user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        professional: {
          select: { userId: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    const isClient = conversation.clientId === userId;
    const isProfessional = conversation.professional.userId === userId;

    if (!isClient && !isProfessional) {
      return NextResponse.json(
        { error: "No tienes acceso a esta conversación" },
        { status: 403 }
      );
    }

    // Parse and validate body with Zod
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const sanitizedContent = stripHtml(parsed.data.content);

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: "El contenido del mensaje es requerido" },
        { status: 400 }
      );
    }

    // Business rule: professionals cannot send the FIRST message
    if (isProfessional) {
      const existingMessageCount = await prisma.directMessage.count({
        where: { conversationId },
      });

      if (existingMessageCount === 0) {
        return NextResponse.json(
          { error: "Los profesionales no pueden enviar el primer mensaje" },
          { status: 403 }
        );
      }
    }

    // Create the message and update conversation's lastMessageAt atomically
    const [message] = await prisma.$transaction([
      prisma.directMessage.create({
        data: {
          conversationId,
          senderId: userId,
          content: sanitizedContent,
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Fire-and-forget notification to the other participant
    const recipientId = isClient
      ? conversation.professional.userId
      : conversation.clientId;
    const senderName = session.user.name;

    const { createNotification } = await import("@/lib/notifications");
    void createNotification({
      userId: recipientId,
      type: "SESSION_CONFIRMED" as const, // TODO: add NEW_MESSAGE to NotificationType enum
      title: "Nuevo mensaje",
      message: `${senderName ?? "Alguien"} te ha enviado un mensaje`,
      link: `/dashboard/${isClient ? "professional" : "client"}?tab=messages`,
    });

    return NextResponse.json(
      {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderImage: message.sender.image,
        content: message.content,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error al enviar mensaje", {
      conversationId: params.id,
      error: String(error),
    });
    return NextResponse.json(
      { error: "Error al enviar mensaje" },
      { status: 500 }
    );
  }
}
