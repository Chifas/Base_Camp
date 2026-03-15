import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProfessionalProfileSchema, updateProfessionalProfileSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

// GET /api/professionals/me — get own professional profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        category: true,
        user: { select: { name: true, email: true, image: true, bio: true } },
        availability: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado", hasProfile: false }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      headline: profile.headline,
      hourlyRate: profile.hourlyRate,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      verified: profile.verified,
      categoryId: profile.categoryId,
      categoryName: profile.category.name,
      categorySlug: profile.category.slug,
      name: profile.user.name,
      email: profile.user.email,
      image: profile.user.image,
      bio: profile.user.bio,
      availability: profile.availability,
      hasProfile: true,
    });
  } catch (error) {
    logger.error("Error GET /api/professionals/me", { error: String(error) });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/professionals/me — create professional profile (onboarding)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Check if already has a profile
    const existing = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya tienes un perfil profesional" }, { status: 409 });
    }

    const body = await req.json();
    const parsed = createProfessionalProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { categoryId, headline, hourlyRate, bio } = parsed.data;

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });
    }

    // Create profile + update user bio in a transaction
    const profile = await prisma.$transaction(async (tx) => {
      if (bio) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { bio },
        });
      }

      return tx.professionalProfile.create({
        data: {
          userId: session.user.id,
          categoryId,
          headline,
          hourlyRate,
        },
        include: { category: true },
      });
    });

    logger.info("professional.profile_created", {
      profileId: profile.id,
      userId: session.user.id,
      category: profile.category.slug,
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    logger.error("Error POST /api/professionals/me", { error: String(error) });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PUT /api/professionals/me — update professional profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "PROFESSIONAL") {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const existing = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateProfessionalProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { categoryId, headline, hourlyRate, bio } = parsed.data;

    // If categoryId provided, verify it exists
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Update user bio if provided
      if (bio !== undefined) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { bio },
        });
      }

      // Build profile update data — only include fields that were sent
      const profileData: Record<string, unknown> = {};
      if (categoryId !== undefined) profileData.categoryId = categoryId;
      if (headline !== undefined) profileData.headline = headline;
      if (hourlyRate !== undefined) profileData.hourlyRate = hourlyRate;

      if (Object.keys(profileData).length > 0) {
        return tx.professionalProfile.update({
          where: { id: existing.id },
          data: profileData,
          include: {
            category: true,
            user: { select: { name: true, bio: true, image: true } },
          },
        });
      }

      return tx.professionalProfile.findUnique({
        where: { id: existing.id },
        include: {
          category: true,
          user: { select: { name: true, bio: true, image: true } },
        },
      });
    });

    logger.info("professional.profile_updated", {
      profileId: existing.id,
      userId: session.user.id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Error PUT /api/professionals/me", { error: String(error) });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
