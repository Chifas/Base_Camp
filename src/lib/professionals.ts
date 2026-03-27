import { prisma } from "@/lib/prisma";
import type { Professional } from "@/types";
import { CATEGORY_LABELS } from "@/types";

/**
 * Fetch and score professionals for the landing page featured section.
 * Applies a daily-rotation factor so the order varies each day.
 */
export async function getFeaturedProfessionals(limit = 4): Promise<Professional[]> {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        availability: true,
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: limit * 2, // fetch extra candidates for scoring
    });

    // Score-based sort with daily rotation
    const dayOfYear = Math.floor(Date.now() / 86400000);
    const scored = professionals.map((p, idx) => ({
      p,
      score:
        p.rating * 0.4 +
        Math.log(p.reviewCount + 1) * 0.3 +
        (p.availability.length > 0 ? 0.2 : 0) +
        ((idx + dayOfYear) % professionals.length) * 0.05,
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit);

    return top.map(({ p }) => ({
      id: p.id,
      userId: p.userId,
      name: p.user.name ?? "",
      image: p.user.image ?? "",
      bio: p.user.bio ?? "",
      headline: p.headline ?? "",
      category: p.category as Professional["category"],
      categoryName: CATEGORY_LABELS[p.category as Professional["category"]] ?? p.category,
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
  } catch {
    return [];
  }
}
