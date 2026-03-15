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

    // Create the review
    const review = await prisma.review.create({
      data: {
        sessionId,
        userId:  session.user.id,
        rating:  Math.round(rating),
        comment: comment?.trim() || null,
      },
    });

    // Update the professional's aggregate rating (incremental, no full scan)
    const profile = await prisma.professionalProfile.findUnique({
      where:  { id: dbSession.professionalId },
      select: { rating: true, reviewCount: true },
    });

    if (profile) {
      const newCount  = profile.reviewCount + 1;
      const newRating = (profile.rating * profile.reviewCount + rating) / newCount;

      await prisma.professionalProfile.update({
        where: { id: dbSession.professionalId },
        data:  {
          reviewCount: newCount,
          rating:      Math.round(newRating * 10) / 10, // 1 decimal place
        },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la reseña" },
      { status: 500 }
    );
  }
}
