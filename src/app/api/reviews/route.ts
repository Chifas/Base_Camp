import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

// POST /api/reviews — create a review for a completed session
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { sessionId, rating, comment } = parsed.data;

    // Verify the session exists and is COMPLETED
    const dbSession = await prisma.session.findUnique({
      where:   { id: sessionId },
      include: { review: true },
    });

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    // Only the client can leave a review
    if (dbSession.clientId !== session.user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    if (dbSession.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Solo puedes reseñar sesiones completadas" },
        { status: 400 }
      );
    }

    // Idempotent: one review per session
    if (dbSession.review) {
      return NextResponse.json(
        { error: "Ya has dejado una reseña para esta sesión" },
        { status: 409 }
      );
    }

    // Create the review and recalculate aggregate rating in a transaction
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          sessionId,
          userId:  session.user.id,
          rating:  Math.round(rating),
          comment: comment?.trim() || null,
        },
      });

      // Recalculate from all reviews (no drift risk)
      const aggregate = await tx.review.aggregate({
        where: {
          session: { professionalId: dbSession.professionalId },
        },
        _avg:   { rating: true },
        _count: { rating: true },
      });

      await tx.professionalProfile.update({
        where: { id: dbSession.professionalId },
        data:  {
          rating:      Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
          reviewCount: aggregate._count.rating,
        },
      });

      return created;
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la reseña" },
      { status: 500 }
    );
  }
}
