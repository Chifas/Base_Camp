import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { SessionWithProfessional } from "@/types/sessions";

/**
 * GET /api/sessions — list sessions for the authenticated user.
 *
 * Query params:
 *   ?status=COMPLETED,CANCELLED  — filter by status (comma-separated)
 *   ?from=2026-01-01             — filter sessions from this date
 *   ?to=2026-03-15               — filter sessions up to this date
 *   ?page=1&limit=20             — pagination
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const page = Math.max(Number(url.searchParams.get("page") ?? 0), 0);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 0), 0), 100);

    // Build where clause for filters
    const dateFilter: Prisma.SessionWhereInput = {};
    if (statusFilter) {
      const statuses = statusFilter.split(",").map((s) => s.trim().toUpperCase());
      dateFilter.status = { in: statuses as ("PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED")[] };
    }
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        dateFilter.scheduledAt = { ...(dateFilter.scheduledAt as object ?? {}), gte: fromDate };
      }
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        dateFilter.scheduledAt = { ...(dateFilter.scheduledAt as object ?? {}), lte: toDate };
      }
    }

    const usePagination = page > 0 && limit > 0;
    const skip = usePagination ? (page - 1) * limit : undefined;
    const take = usePagination ? limit : undefined;

    const role = session.user.role;

    if (role === "PROFESSIONAL") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil profesional no encontrado" },
          { status: 404 }
        );
      }

      const where: Prisma.SessionWhereInput = {
        professionalId: profile.id,
        ...dateFilter,
      };

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where,
          include: {
            client: { select: { id: true, name: true, image: true } },
            _count: { select: { messages: true } },
          },
          orderBy: { scheduledAt: "desc" },
          ...(skip !== undefined ? { skip } : {}),
          ...(take !== undefined ? { take } : {}),
        }),
        usePagination ? prisma.session.count({ where }) : Promise.resolve(0),
      ]);

      const data = sessions.map((s) => ({
        id: s.id,
        clientId: s.clientId,
        professionalId: s.professionalId,
        clientName: s.client.name ?? "Cliente",
        clientImage: s.client.image ?? "",
        scheduledAt: s.scheduledAt.toISOString(),
        duration: s.duration,
        status: s.status,
        price: s.price,
        dailyRoomUrl: s.status === "CONFIRMED" ? s.dailyRoomUrl : null,
        notes: s.notes,
        cancellationFee: s.cancellationFee,
        messageCount: s._count.messages,
      }));

      if (usePagination) {
        return NextResponse.json({
          sessions: data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      }

      return NextResponse.json(data);
    }

    // CLIENT role
    const where: Prisma.SessionWhereInput = {
      clientId: session.user.id,
      ...dateFilter,
    };

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          professional: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
      }),
      usePagination ? prisma.session.count({ where }) : Promise.resolve(0),
    ]);

    const data = (sessions as SessionWithProfessional[]).map((s) => ({
      id: s.id,
      clientId: s.clientId,
      professionalId: s.professionalId,
      professionalName: s.professional.user.name ?? "Profesional",
      professionalImage: s.professional.user.image ?? "",
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration,
      status: s.status,
      price: s.price,
      dailyRoomUrl: s.status === "CONFIRMED" ? s.dailyRoomUrl : null,
      cancellationFee: s.cancellationFee,
    }));

    if (usePagination) {
      return NextResponse.json({
        sessions: data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/sessions]", error);
    return NextResponse.json(
      { error: "Error al obtener sesiones" },
      { status: 500 }
    );
  }
}
