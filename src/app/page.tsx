import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedProfessionals } from "@/components/landing/featured-professionals";
import type { Professional } from "@/types";

const Testimonials = dynamic(() =>
  import("@/components/landing/testimonials").then((m) => m.Testimonials)
);
const CTA = dynamic(() =>
  import("@/components/landing/cta").then((m) => m.CTA)
);

// Metadata inherited from root layout (title.default + OG + Twitter Cards)

async function getFeaturedProfessionals(): Promise<Professional[]> {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        category: true,
        availability: true,
      },
      orderBy: { rating: "desc" },
      take: 4,
    });

    return professionals.map((p) => ({
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
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const professionals = await getFeaturedProfessionals();

  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedProfessionals professionals={professionals} />
      <Testimonials />
      <CTA />
    </>
  );
}
