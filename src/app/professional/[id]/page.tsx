import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/types";
import type { ProfessionalCategory, Review } from "@/types";
import { BookingCard } from "./booking-card";
import { ReviewsSection } from "./reviews-section";
import { SendMessageButton } from "./send-message-button";
import { ProfileHero } from "./profile-hero";

const DAYS = [
  "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado",
];

async function getProfessional(id: string) {
  return prisma.professionalProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true, bio: true } },
      availability: { orderBy: { dayOfWeek: "asc" } },
      certifications: { orderBy: { createdAt: "desc" } },
      sessions: {
        where: { status: "COMPLETED" },
        include: {
          review: {
            include: { user: { select: { name: true, image: true } } },
          },
        },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const professional = await getProfessional(params.id);
  if (!professional) return { title: "Profesional no encontrado" };

  const name = professional.user.name ?? "Profesional";
  const headline = professional.headline ?? "";
  const bio = professional.user.bio ?? "";

  return {
    title: `${name} — ${headline}`,
    description: `${headline}. ${bio.slice(0, 150)}${bio.length > 150 ? "..." : ""}`,
    openGraph: {
      title: `${name} — ${headline}`,
      description: `${headline}. Reserva tu sesión en GuidePath.`,
      images: professional.user.image ? [{ url: professional.user.image }] : [],
    },
  };
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const professional = await getProfessional(params.id);

  if (!professional) notFound();

  const name     = professional.user.name ?? "";
  const image    = professional.user.image ?? "";
  const bio      = professional.user.bio ?? "";
  const headline = professional.headline ?? "";
  const category = professional.category as ProfessionalCategory;

  const reviews: Review[] = professional.sessions
    .filter((s) => s.review)
    .map((s) => ({
      id: s.review!.id,
      sessionId: s.id,
      userName: s.review!.user.name ?? "Usuario",
      userImage: s.review!.user.image ?? "",
      rating: s.review!.rating,
      ratingPunctuality: s.review!.ratingPunctuality ?? undefined,
      ratingKnowledge: s.review!.ratingKnowledge ?? undefined,
      ratingCommunication: s.review!.ratingCommunication ?? undefined,
      ratingValue: s.review!.ratingValue ?? undefined,
      comment: s.review!.comment ?? "",
      professionalResponse: s.review!.professionalResponse ?? undefined,
      respondedAt: s.review!.respondedAt?.toISOString(),
      createdAt: s.review!.createdAt.toISOString(),
    }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    image: image || undefined,
    jobTitle: headline,
    description: bio.slice(0, 300),
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://guidepath.vercel.app"}/professional/${professional.id}`,
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `Sesión con ${name}`,
        description: headline,
      },
      price: "0",
      priceCurrency: "EUR",
    },
    ...(professional.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: professional.rating.toString(),
        reviewCount: professional.reviewCount.toString(),
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };

  const todayDow = new Date().getDay();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — full width */}
      <ProfileHero
        name={name}
        image={image}
        headline={headline}
        rating={professional.rating}
        reviewCount={professional.reviewCount}
        verified={professional.verified}
        categoryLabel={CATEGORY_LABELS[category]}
        yearsExperience={professional.yearsExperience ?? undefined}
        languages={professional.languages}
        hasAvailability={professional.availability.length > 0}
      />

      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Bio */}
            <FadeIn delay={0.1}>
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                    Sobre mí
                  </h2>
                </div>
                <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                  {bio}
                </p>
              </div>
            </FadeIn>

            {/* Specialties — extracted from headline */}
            {headline && (
              <FadeIn delay={0.12}>
                <div className="flex flex-wrap gap-2">
                  {headline
                    .split("·")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-teal-50 dark:bg-teal-900/20 px-3 py-1 text-sm font-medium text-teal-700 dark:text-teal-300"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </FadeIn>
            )}

            {/* Certifications */}
            {professional.certifications.length > 0 && (
              <FadeIn delay={0.14}>
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                      Certificaciones
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {professional.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-start gap-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 p-4"
                      >
                        <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                        <div>
                          <p className="font-display font-semibold text-stone-900 dark:text-stone-50">
                            {cert.title}
                          </p>
                          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                            {cert.institution}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Availability */}
            <FadeIn delay={0.15}>
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                    Disponibilidad semanal
                  </h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {DAYS.map((day, dayIndex) => {
                    const slot = professional.availability.find(
                      (a) => a.dayOfWeek === dayIndex
                    );
                    const isToday = dayIndex === todayDow;

                    if (slot) {
                      return (
                        <div
                          key={dayIndex}
                          className="relative shrink-0 min-w-[72px] rounded-xl border border-teal-100 bg-teal-50 p-3 text-center dark:border-teal-900 dark:bg-teal-900/20"
                        >
                          {isToday && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                              Hoy
                            </span>
                          )}
                          <p className="font-display text-xs font-semibold text-stone-900 dark:text-stone-50">
                            {day.slice(0, 3)}
                          </p>
                          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                            {slot.startTime}
                          </p>
                          <p className="text-[11px] text-stone-400 dark:text-stone-500">
                            {slot.endTime}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={dayIndex}
                        className="shrink-0 min-w-[72px] rounded-xl border border-stone-100 bg-stone-100 p-3 text-center opacity-40 dark:border-stone-800 dark:bg-stone-800"
                      >
                        <p className="font-display text-xs font-semibold text-stone-400 dark:text-stone-500">
                          {day.slice(0, 3)}
                        </p>
                        <p className="mt-1 text-[11px] text-stone-300 dark:text-stone-600">–</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Reviews */}
            <FadeIn delay={0.2}>
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                    Reseñas
                  </h2>
                </div>
                <div>
                  <ReviewsSection
                    reviews={reviews}
                    rating={professional.rating}
                    reviewCount={professional.reviewCount}
                  />
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── Right column — sticky ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <BookingCard
                professionalId={professional.id}
                availability={professional.availability.map((a) => ({
                  id: a.id,
                  dayOfWeek: a.dayOfWeek,
                  startTime: a.startTime,
                  endTime: a.endTime,
                }))}
                socialImpactScore={professional.socialImpactScore}
              />
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
                <p className="mb-3 text-sm text-muted-foreground">
                  ¿Tienes alguna pregunta antes de reservar?
                </p>
                <SendMessageButton
                  professionalId={professional.id}
                  professionalName={name}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
