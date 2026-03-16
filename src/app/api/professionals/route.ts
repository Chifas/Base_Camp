import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/types";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const language = searchParams.get("language") || "";
    const available = searchParams.get("available") === "true";
    const sort = searchParams.get("sort") || "relevance";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 100);

    // Build where clause
    const where: Prisma.ProfessionalProfileWhereInput = {};

    if (category) {
      where.category = category as Prisma.EnumProfessionalCategoryFilter;
    }

    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (minPrice > 0 || maxPrice > 0) {
      where.hourlyRate = {};
      if (minPrice > 0) where.hourlyRate.gte = minPrice;
      if (maxPrice > 0) where.hourlyRate.lte = maxPrice;
    }

    if (language) {
      where.languages = { has: language };
    }

    if (available) {
      where.availability = { some: {} };
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { headline: { contains: search, mode: "insensitive" } },
        { user: { bio: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.professionalProfile.count({ where });

    // Determine ordering
    let orderBy: Prisma.ProfessionalProfileOrderByWithRelationInput = { rating: "desc" };
    if (sort === "price-low") orderBy = { hourlyRate: "asc" };
    else if (sort === "price-high") orderBy = { hourlyRate: "desc" };
    else if (sort === "reviews") orderBy = { reviewCount: "desc" };
    // For "relevance" and "rating", we use rating desc as base and apply scoring in-memory

    const skip = (page - 1) * limit;

    const professionals = await prisma.professionalProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, image: true, bio: true },
        },
        availability: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    let data = professionals.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name ?? "",
      image: p.user.image ?? "",
      bio: p.user.bio ?? "",
      headline: p.headline ?? "",
      category: p.category,
      categoryName: CATEGORY_LABELS[p.category] ?? p.category,
      hourlyRate: p.hourlyRate,
      rating: p.rating,
      reviewCount: p.reviewCount,
      verified: p.verified,
      languages: p.languages,
      yearsExperience: p.yearsExperience,
      availability: p.availability.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    }));

    // Apply relevance scoring sort in-memory
    if (sort === "relevance") {
      data = data.sort((a, b) => {
        const scoreA = a.rating * 0.4 + Math.log(a.reviewCount + 1) * 0.3 + (a.availability.length > 0 ? 0.2 : 0) + (a.hourlyRate > 0 ? (1 / a.hourlyRate) * 10 : 0) * 0.1;
        const scoreB = b.rating * 0.4 + Math.log(b.reviewCount + 1) * 0.3 + (b.availability.length > 0 ? 0.2 : 0) + (b.hourlyRate > 0 ? (1 / b.hourlyRate) * 10 : 0) * 0.1;
        return scoreB - scoreA;
      });
    }

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[/api/professionals]", error);
    return NextResponse.json(
      { error: "Error al obtener profesionales" },
      { status: 500 }
    );
  }
}
