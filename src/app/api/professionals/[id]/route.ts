import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, image: true, bio: true },
        },
        availability: true,
        certifications: {
          orderBy: { createdAt: "desc" },
        },
        sessions: {
          where: { status: "COMPLETED" },
          include: {
            review: {
              include: {
                user: { select: { name: true, image: true } },
              },
            },
          },
          orderBy: { scheduledAt: "desc" },
          take: 10,
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    const reviews = professional.sessions
      .filter((s) => s.review)
      .map((s) => ({
        id: s.review!.id,
        sessionId: s.id,
        userName: s.review!.user.name ?? "Usuario",
        userImage: s.review!.user.image ?? "",
        rating: s.review!.rating,
        ratingPunctuality: s.review!.ratingPunctuality,
        ratingKnowledge: s.review!.ratingKnowledge,
        ratingCommunication: s.review!.ratingCommunication,
        ratingValue: s.review!.ratingValue,
        comment: s.review!.comment ?? "",
        professionalResponse: s.review!.professionalResponse,
        respondedAt: s.review!.respondedAt?.toISOString() ?? null,
        createdAt: s.review!.createdAt.toISOString(),
      }));

    const catRow = await prisma.category.findUnique({ where: { id: professional.category }, select: { name: true } });

    return NextResponse.json({
      id: professional.id,
      userId: professional.userId,
      name: professional.user.name ?? "",
      image: professional.user.image ?? "",
      bio: professional.user.bio ?? "",
      headline: professional.headline ?? "",
      category: professional.category,
      categoryName: catRow?.name ?? professional.category,
      hourlyRate: professional.hourlyRate,
      rating: professional.rating,
      reviewCount: professional.reviewCount,
      verified: professional.verified,
      verifiedAt: professional.verifiedAt?.toISOString() ?? null,
      languages: professional.languages,
      yearsExperience: professional.yearsExperience,
      coverImage: professional.coverImage,
      certifications: professional.certifications.map((c) => ({
        id: c.id,
        title: c.title,
        institution: c.institution,
        year: c.year,
      })),
      availability: professional.availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
      reviews,
    });
  } catch (error) {
    console.error("[/api/professionals/[id]]", error);
    return NextResponse.json(
      { error: "Error al obtener el profesional" },
      { status: 500 }
    );
  }
}
