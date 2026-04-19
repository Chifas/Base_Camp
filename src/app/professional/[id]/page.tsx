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
  MessageSquare,
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/types";
import type { ProfessionalCategory, Review } from "@/types";
import { BookingCard } from "./booking-card";
import { ReviewsSection } from "./reviews-section";
import { SendMessageButton } from "./send-message-button";
import { ProfileReveal } from "./profile-reveal";

const DAYS = [
  "Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado",
];
const DAYS_SHORT = ["D", "L", "M", "X", "J", "V", "S"];

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

  const completedSessions = professional.sessions.length;
  const availableDaysSet = new Set(professional.availability.map((s) => s.dayOfWeek));

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

      <ProfileReveal>
        <div className="relative">
          {/* Aurora backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/10 via-violet-500/8 to-transparent blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/explore"
              data-profile-enter
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a explorar
            </Link>

            {/* Bento grid */}
            <div
              data-profile-grid
              className="mt-6 grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12"
            >
              {/* HERO — Name + photo + headline (large) */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8 row-span-2"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white sm:p-8">
                  {/* aurora backdrop */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      background:
                        "radial-gradient(70% 60% at 20% 10%, rgba(99,102,241,0.55) 0%, transparent 70%), radial-gradient(55% 50% at 90% 90%, rgba(236,72,153,0.35) 0%, transparent 60%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <div className="relative z-[1] flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white/10 sm:h-36 sm:w-36">
                      <Image
                        src={image || "/placeholder-avatar.png"}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="144px"
                        priority
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                          {CATEGORY_LABELS[category]}
                        </Badge>
                        {professional.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/30">
                            <CheckCircle2 className="h-3 w-3" /> Verificado
                          </span>
                        )}
                      </div>
                      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        {name}
                      </h1>
                      <p className="mt-2 text-lg text-white/80 sm:text-xl">
                        {headline}
                      </p>

                      {/* Inline chips */}
                      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-semibold">{professional.rating.toFixed(1)}</span>
                          <span className="text-white/60">({professional.reviewCount})</span>
                        </span>
                        {professional.yearsExperience && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                            <Award className="h-3.5 w-3.5" />
                            {professional.yearsExperience} años
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                          <Clock className="h-3.5 w-3.5" />
                          60 min
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                          <Video className="h-3.5 w-3.5" />
                          Videollamada
                        </span>
                      </div>

                      {professional.languages.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-white/60" />
                          <div className="flex flex-wrap gap-1">
                            {professional.languages.map((lang) => (
                              <Badge
                                key={lang}
                                className="border-white/20 bg-transparent text-xs text-white/80"
                                variant="outline"
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOKING CARD (sticky on large) */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-4 row-span-2 lg:row-span-3"
              >
                <div className="sticky top-24">
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

              {/* Stat: rating */}
              <div
                data-bento-card
                className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2"
              >
                <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white">
                  <Star className="h-5 w-5 fill-white" />
                  <div>
                    <p className="font-heading text-3xl font-bold leading-none sm:text-4xl">
                      {professional.rating.toFixed(1)}
                      <span className="ml-0.5 text-base opacity-80">/5</span>
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider opacity-90">
                      {professional.reviewCount} reseñas
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat: sessions */}
              <div
                data-bento-card
                className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2"
              >
                <div className="flex h-full flex-col justify-between rounded-3xl border bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <p className="font-heading text-3xl font-bold leading-none sm:text-4xl">
                      {completedSessions}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider opacity-90">
                      sesiones completadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat: impact */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-4"
              >
                <div className="flex h-full items-center gap-4 rounded-3xl border bg-card p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/15 text-pink-500">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold leading-none sm:text-2xl">
                      {professional.socialImpactScore} pts
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Impact Points acumulados
                    </p>
                  </div>
                </div>
              </div>

              {/* BIO card */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8"
              >
                <div className="flex h-full flex-col gap-3 rounded-3xl border bg-card p-6 sm:p-7">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h2 className="font-heading text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                      Sobre mí
                    </h2>
                  </div>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                    {bio || "Este profesional aún no ha añadido su biografía."}
                  </p>
                </div>
              </div>

              {/* Availability compact */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-3 lg:col-span-4"
              >
                <div className="flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h2 className="font-heading text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                      Disponibilidad
                    </h2>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_SHORT.map((d, i) => {
                      const available = availableDaysSet.has(i);
                      return (
                        <div
                          key={i}
                          className={`flex aspect-square items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                            available
                              ? "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400"
                              : "bg-muted/50 text-muted-foreground/40"
                          }`}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    {professional.availability.slice(0, 4).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5"
                      >
                        <span className="font-medium">{DAYS[slot.dayOfWeek]}</span>
                        <span className="text-muted-foreground">
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    ))}
                    {professional.availability.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Sin franjas configuradas.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {professional.certifications.length > 0 && (
                <div
                  data-bento-card
                  className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-8"
                >
                  <div className="flex h-full flex-col gap-4 rounded-3xl border bg-card p-6">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Certificaciones
                    </h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {professional.certifications.map((cert) => (
                        <div
                          key={cert.id}
                          className="group relative overflow-hidden rounded-2xl border bg-background p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-600" />
                          <p className="pl-2 font-medium">{cert.title}</p>
                          <p className="pl-2 text-xs text-muted-foreground">
                            {cert.institution}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Message CTA */}
              <div
                data-bento-card
                className={`col-span-2 sm:col-span-4 md:col-span-${
                  professional.certifications.length > 0 ? 3 : 3
                } lg:col-span-4`}
              >
                <div className="flex h-full flex-col justify-between gap-3 rounded-3xl border bg-card p-5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      ¿Dudas antes de reservar?
                    </p>
                  </div>
                  <SendMessageButton
                    professionalId={professional.id}
                    professionalName={name}
                  />
                </div>
              </div>

              {/* Reviews section — full width */}
              <div
                data-bento-card
                className="col-span-2 sm:col-span-4 md:col-span-6 lg:col-span-12"
              >
                <div className="rounded-3xl border bg-card p-6 sm:p-8">
                  <ReviewsSection
                    reviews={reviews}
                    rating={professional.rating}
                    reviewCount={professional.reviewCount}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProfileReveal>
    </>
  );
}
