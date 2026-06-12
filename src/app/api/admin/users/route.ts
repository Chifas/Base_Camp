import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 20;

/** GET /api/admin/users?search=&role=&page= — user directory. */
export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() ?? "";
    const role = url.searchParams.get("role") ?? "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role === "CLIENT" || role === "PROFESSIONAL" || role === "ADMIN") {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscriptionTier: true,
          _count: { select: { clientSessions: true, reviews: true } },
          professionalProfile: {
            select: { verified: true, totalSessionsCompleted: true, rating: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        subscriptionTier: u.subscriptionTier,
        sessionCount:
          u.role === "PROFESSIONAL"
            ? u.professionalProfile?.totalSessionsCompleted ?? 0
            : u._count.clientSessions,
        reviewCount: u._count.reviews,
        verified: u.professionalProfile?.verified ?? null,
        rating: u.professionalProfile?.rating ?? null,
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    logger.error("Error listando usuarios", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
