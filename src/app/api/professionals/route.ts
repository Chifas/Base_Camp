import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, image: true, bio: true },
        },
        category: true,
        availability: true,
      },
      orderBy: { rating: "desc" },
    });

    const data = professionals.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name ?? "",
      image: p.user.image ?? "",
      bio: p.user.bio ?? "",
      headline: p.headline ?? "",
      category: p.category.slug,
      categoryName: p.category.name,
      hourlyRate: p.hourlyRate,
      rating: p.rating,
      reviewCount: p.reviewCount,
      verified: p.verified,
      availability: p.availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/professionals]", error);
    return NextResponse.json(
      { error: "Error al obtener profesionales" },
      { status: 500 }
    );
  }
}
