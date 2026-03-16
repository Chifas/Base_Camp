import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json([], { status: 200 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        session: { professionalId: profile.id },
      },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        userName: r.user.name ?? "Anónimo",
        userImage: r.user.image ?? "",
        rating: r.rating,
        ratingPunctuality: r.ratingPunctuality,
        ratingKnowledge: r.ratingKnowledge,
        ratingCommunication: r.ratingCommunication,
        ratingValue: r.ratingValue,
        comment: r.comment,
        professionalResponse: r.professionalResponse,
        respondedAt: r.respondedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[/api/reviews/received]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
