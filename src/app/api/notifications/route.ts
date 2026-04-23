import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markNotificationsSchema } from "@/lib/validations";

/**
 * GET /api/notifications — list notifications for the authenticated user.
 * Query params: ?limit=20&page=1
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
  const skip = (page - 1) * limit;

  try {
    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
      prisma.notification.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[/api/notifications GET]", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications — mark notifications as read.
 * Body: { ids: string[] } or { all: true }
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = markNotificationsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if ("all" in data && data.all) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      });
    } else if ("ids" in data) {
      await prisma.notification.updateMany({
        where: {
          id: { in: data.ids },
          userId: session.user.id,
        },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/notifications PATCH]", error);
    return NextResponse.json(
      { error: "Error al actualizar notificaciones" },
      { status: 500 }
    );
  }
}
