import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  CheckCircle2,
  Clock,
  Video,
  ChevronLeft,
  Globe,
  Award,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/types";
import type { ProfessionalCategory, Review } from "@/types";
import { BookingCard } from "./booking-card";
import { ReviewsSection } from "./reviews-section";

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

  const name = professional.user.name ?? "";
  const image = professional.user.image ?? "";
  const bio = professional.user.bio ?? "";
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <FadeIn>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a explorar
          </Link>
        </FadeIn>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Left column - Profile info */}
          <div className="lg:col-span-2 space-y-8">
            <FadeIn>
              {/* Profile header */}
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={image || "/placeholder-avatar.png"}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="128px"
                    priority
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading text-2xl font-bold sm:text-3xl">{name}</h1>
                    {professional.verified && (
                      <span title="Profesional verificado">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-lg text-muted-foreground">{headline}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">{CATEGORY_LABELS[category]}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{professional.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({professional.reviewCount} reseñas)
                      </span>
                    </div>
                    {professional.yearsExperience && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="h-4 w-4" />
                        {professional.yearsExperience} años de experiencia
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Sesiones de 60 min
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      Videollamada
                    </div>
                  </div>

                  {/* Languages */}
                  {professional.languages.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {professional.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Bio */}
            <FadeIn delay={0.1}>
              <div>
                <h2 className="font-heading text-xl font-semibold">Sobre mí</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{bio}</p>
              </div>
            </FadeIn>

            {/* Certifications */}
            {professional.certifications.length > 0 && (
              <>
                <Separator />
                <FadeIn delay={0.12}>
                  <div>
                    <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Certificaciones
                    </h2>
                    <div className="mt-4 space-y-3">
                      {professional.certifications.map((cert) => (
                        <div key={cert.id} className="rounded-lg border bg-card p-4">
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.institution}{cert.year ? ` · ${cert.year}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </>
            )}

            <Separator />

            {/* Availability overview */}
            <FadeIn delay={0.15}>
              <div>
                <h2 className="font-heading text-xl font-semibold">Disponibilidad semanal</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {professional.availability.map((slot) => (
                    <div key={slot.id} className="rounded-lg border bg-card p-3 text-center">
                      <p className="text-sm font-medium">{DAYS[slot.dayOfWeek]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <Separator />

            {/* Reviews */}
            <FadeIn delay={0.2}>
              <ReviewsSection
                reviews={reviews}
                rating={professional.rating}
                reviewCount={professional.reviewCount}
              />
            </FadeIn>
          </div>

          {/* Right column - Booking card */}
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>
    </>
  );
}
