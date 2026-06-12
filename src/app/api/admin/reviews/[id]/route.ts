import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

/** PATCH /api/admin/reviews/[id] — dismiss the report (the review stays visible). */
export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) {
      return NextResponse.json({ error: "Review no encontrada" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id: params.id },
      data: { reported: false, reportReason: null, reportedAt: null },
    });

    logger.info("Reporte de review descartado", { reviewId: params.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error descartando reporte", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/** DELETE /api/admin/reviews/[id] — remove the review and fix the aggregate rating. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { session: { select: { professionalId: true } } },
    });
    if (!review) {
      return NextResponse.json({ error: "Review no encontrada" }, { status: 404 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { id: review.session.professionalId },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
    }

    // Reverse the incremental aggregate: (oldRating * oldCount - reviewRating) / newCount
    const newCount = Math.max(0, profile.reviewCount - 1);
    const newRating =
      newCount > 0
        ? (profile.rating * profile.reviewCount - review.rating) / newCount
        : 0;

    await prisma.$transaction([
      prisma.review.delete({ where: { id: params.id } }),
      prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { rating: newRating, reviewCount: newCount },
      }),
    ]);

    logger.info("Review eliminada por moderación", {
      reviewId: params.id,
      professionalId: profile.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error eliminando review", { error: String(error) });
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
