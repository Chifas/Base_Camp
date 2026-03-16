import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedProfessionals } from "@/components/landing/featured-professionals";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import type { Professional } from "@/types";
import { CATEGORY_LABELS } from "@/types";

export const metadata: Metadata = {
  title: "GuidePath — Encuentra tu camino con profesionales que te guían",
  description:
    "Marketplace que conecta personas que buscan orientación con psicólogos, coaches, mentores de carrera y nutricionistas certificados. Sesiones por videollamada, fácil y seguro.",
  openGraph: {
    title: "GuidePath — Encuentra tu camino con profesionales que te guían",
    description:
      "Conectamos personas con psicólogos, coaches, mentores y nutricionistas certificados.",
    siteName: "GuidePath",
    type: "website",
    locale: "es_ES",
  },
};

async function getFeaturedProfessionals(): Promise<Professional[]> {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      where: {
        reviewCount: { gte: 1 },
      },
      include: {
        user: { select: { id: true, name: true, image: true, bio: true } },
        availability: true,
      },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: 8,
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
    const top = scored.slice(0, 4);

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
