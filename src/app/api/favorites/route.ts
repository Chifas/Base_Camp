import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleSchema = z.object({
  professionalId: z.string().min(1),
});

/** GET /api/favorites — saved professionals for the current user.
 *  ?include=details → returns full professional info (name, image, headline, rating…)
 *  Default           → returns only { ids: string[] }
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const includeDetails = new URL(req.url).searchParams.get("include") === "details";

  if (includeDetails) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        professional: {
          include: {
            user: { select: { id: true, name: true, image: true, bio: true } },
            availability: { select: { dayOfWeek: true, startTime: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = favorites.map((f) => ({
      professionalId: f.professionalId,
      savedAt: f.createdAt.toISOString(),
      name: f.professional.user.name ?? "",
      image: f.professional.user.image ?? "",
      bio: f.professional.user.bio ?? "",
      headline: f.professional.headline ?? "",
      category: f.professional.category,
      hourlyRate: f.professional.hourlyRate,
      rating: f.professional.rating,
      reviewCount: f.professional.reviewCount,
      verified: f.professional.verified,
      languages: f.professional.languages,
      yearsExperience: f.professional.yearsExperience,
    }));

    return NextResponse.json({ data });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { professionalId: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ids: favorites.map((f) => f.professionalId) });
}

/** POST /api/favorites — toggle save/unsave for a professional */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "professionalId es obligatorio" }, { status: 400 });
  }

  const { professionalId } = parsed.data;

  const existing = await prisma.favorite.findUnique({
    where: { userId_professionalId: { userId: session.user.id, professionalId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  // Verify the professional exists before saving
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
    select: { id: true },
  });
  if (!professional) {
    return NextResponse.json({ error: "Profesional no encontrado" }, { status: 404 });
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, professionalId },
  });
  return NextResponse.json({ saved: true });
}
