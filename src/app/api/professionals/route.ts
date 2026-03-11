import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProfessionalCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query    = searchParams.get("q") ?? "";
    const category = searchParams.get("category") ?? "";
    const sortBy   = searchParams.get("sort") ?? "rating";

    const professionals = await prisma.professionalProfile.findMany({
      where: {
        ...(category && { category: category as ProfessionalCategory }),
        ...(query && {
          OR: [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { headline: { contains: query, mode: "insensitive" } },
            { user: { bio: { contains: query, mode: "insensitive" } } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        availability: true,
      },
      orderBy:
        sortBy === "price-low"  ? { hourlyRate: "asc" }  :
        sortBy === "price-high" ? { hourlyRate: "desc" } :
        sortBy === "reviews"    ? { reviewCount: "desc" } :
                                  { rating: "desc" },
    });

    return NextResponse.json(professionals);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener profesionales" },
      { status: 500 }
    );
  }
}
