import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

/** GET /api/admin/reviews — moderation queue of reported reviews. */
export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      where: { reported: true },
      orderBy: { reportedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: {
          select: {
            id: true,
            scheduledAt: true,
            professional: {
              select: { id: true, user: { select: { name: true } } },
            },
          },
        },
      },
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reportReason: r.reportReason,
        reportedAt: r.reportedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        authorName: r.user.name ?? "Usuario eliminado",
        authorEmail: r.user.email,
        professionalName: r.session.professional.user.name ?? "Profesional",
        sessionDate: r.session.scheduledAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error("Error listando reviews reportadas", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
