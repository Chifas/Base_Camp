import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";
import { stripHtml } from "@/lib/sanitize";
import { sendNewReviewEmail } from "@/lib/emails";
import { createNotification } from "@/lib/notifications";

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
        { error: parsed.error.errors[0]?.message ?? "Error de validación" },
        { status: 400 }
      );
    }

    const { sessionId, rating, comment, ratingPunctuality, ratingKnowledge, ratingCommunication, ratingValue } = parsed.data;

    // Verify the session exists and is COMPLETED
    const dbSession = await prisma.session.findUnique({
      where:   { id: sessionId },
      include: {
        review: true,
        professional: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        client: { select: { name: true } },
      },
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
          ratingPunctuality: ratingPunctuality ? Math.round(ratingPunctuality) : null,
          ratingKnowledge: ratingKnowledge ? Math.round(ratingKnowledge) : null,
          ratingCommunication: ratingCommunication ? Math.round(ratingCommunication) : null,
          ratingValue: ratingValue ? Math.round(ratingValue) : null,
          comment: comment ? stripHtml(comment) : null,
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

    // Fire-and-forget: email + in-app notification to professional
    const professionalUser = dbSession.professional.user;
    void sendNewReviewEmail({
      professionalEmail: professionalUser.email,
      professionalName: professionalUser.name ?? "Profesional",
      clientName: dbSession.client.name ?? "Un cliente",
      rating,
      comment: comment?.trim() || null,
    });
    void createNotification({
      userId: professionalUser.id,
      type: "NEW_REVIEW",
      title: "Nueva reseña recibida",
      message: `${dbSession.client.name ?? "Un cliente"} te ha dejado una valoración de ${rating} estrellas.`,
      link: "/dashboard/professional",
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al guardar la reseña" },
      { status: 500 }
    );
  }
}
