import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiter for conversation creation: max 10 per hour per user
function conversationLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "rl:conversation",
  });
}

// ────────────────────────────────────────────────────────────────────────────
// GET /api/conversations — list conversations for the authenticated user
// ────────────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    if (role === "PROFESSIONAL") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil profesional no encontrado" },
          { status: 404 }
        );
      }

      const conversations = await prisma.conversation.findMany({
        where: { professionalId: profile.id },
        include: {
          client: {
            select: { id: true, name: true, image: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      // Count unread messages per conversation in a single query
      const unreadCounts = await prisma.directMessage.groupBy({
        by: ["conversationId"],
        where: {
          conversationId: { in: conversations.map((c) => c.id) },
          senderId: { not: userId },
          read: false,
        },
        _count: { id: true },
      });

      const unreadMap = new Map(
        unreadCounts.map((u) => [u.conversationId, u._count.id])
      );

      const data = conversations.map((c) => ({
        id: c.id,
        otherUser: {
          id: c.client.id,
          name: c.client.name,
          image: c.client.image,
        },
        lastMessage: c.messages[0]
          ? {
              content: c.messages[0].content,
              createdAt: c.messages[0].createdAt.toISOString(),
              isOwn: c.messages[0].senderId === userId,
            }
          : null,
        unreadCount: unreadMap.get(c.id) ?? 0,
        messageCount: c._count.messages,
        createdAt: c.createdAt.toISOString(),
        lastMessageAt: c.lastMessageAt.toISOString(),
      }));

      return NextResponse.json(data);
    }

    // CLIENT role
    const conversations = await prisma.conversation.findMany({
      where: { clientId: userId },
      include: {
        professional: {
          select: {
            id: true,
            headline: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Count unread messages per conversation in a single query
    const unreadCounts = await prisma.directMessage.groupBy({
      by: ["conversationId"],
      where: {
        conversationId: { in: conversations.map((c) => c.id) },
        senderId: { not: userId },
        read: false,
      },
      _count: { id: true },
    });

    const unreadMap = new Map(
      unreadCounts.map((u) => [u.conversationId, u._count.id])
    );

    const data = conversations.map((c) => ({
      id: c.id,
      otherUser: {
        id: c.professional.user.id,
        name: c.professional.user.name,
        image: c.professional.user.image,
        headline: c.professional.headline,
      },
      lastMessage: c.messages[0]
        ? {
            content: c.messages[0].content,
            createdAt: c.messages[0].createdAt.toISOString(),
            isOwn: c.messages[0].senderId === userId,
          }
        : null,
      unreadCount: unreadMap.get(c.id) ?? 0,
      messageCount: c._count.messages,
      createdAt: c.createdAt.toISOString(),
      lastMessageAt: c.lastMessageAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error al listar conversaciones", {
      error: String(error),
    });
    return NextResponse.json(
      { error: "Error al obtener conversaciones" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/conversations — create or get existing conversation (CLIENT ONLY)
// Body: { professionalId }
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (session.user.role === "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Solo los clientes pueden iniciar conversaciones" },
        { status: 403 }
      );
    }

    // Rate limit conversation creation
    const rl = await checkRateLimit(conversationLimiter(), session.user.id);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas conversaciones. Inténtalo más tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { professionalId } = body as { professionalId?: string };

    if (!professionalId || typeof professionalId !== "string") {
      return NextResponse.json(
        { error: "professionalId es requerido" },
        { status: 400 }
      );
    }

    // Verify the professional profile exists
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Upsert: create if new, return existing if already exists
    const conversation = await prisma.conversation.upsert({
      where: {
        clientId_professionalId: {
          clientId: session.user.id,
          professionalId,
        },
      },
      create: {
        clientId: session.user.id,
        professionalId,
      },
      update: {},
      include: {
        professional: {
          select: {
            id: true,
            headline: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    logger.error("Error al crear conversación", {
      error: String(error),
    });
    return NextResponse.json(
      { error: "Error al crear conversación" },
      { status: 500 }
    );
  }
}
