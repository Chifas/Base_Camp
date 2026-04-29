import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap, Target, Briefcase, Heart, Compass, Lightbulb, Quote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const SPECIALTY_ICONS: ReadonlyArray<LucideIcon> = [Target, Briefcase, Heart, Compass, Lightbulb];

function pickSpecialtyIcon(label: string): LucideIcon {
  const idx = label.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % SPECIALTY_ICONS.length;
  return SPECIALTY_ICONS[idx] ?? Target;
}

function splitBio(bio: string): { lead: string; rest: string } {
  const trimmed = bio.trim();
  // Take first sentence (until first . ! ?), keep the rest. [\s\S] matches newlines too.
  const match = trimmed.match(/^([^.!?]+[.!?])([\s\S]*)$/);
  if (!match || !match[1]) return { lead: trimmed, rest: "" };
  return { lead: match[1].trim(), rest: (match[2] ?? "").trim() };
}

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
    .map((s) => {
      const r = s.review!;
      return {
        id: r.id,
        sessionId: s.id,
        userName: r.user.name ?? "Usuario",
        userImage: r.user.image ?? "",
        rating: r.rating,
        ...(r.ratingPunctuality !== null ? { ratingPunctuality: r.ratingPunctuality } : {}),
        ...(r.ratingKnowledge !== null ? { ratingKnowledge: r.ratingKnowledge } : {}),
        ...(r.ratingCommunication !== null ? { ratingCommunication: r.ratingCommunication } : {}),
        ...(r.ratingValue !== null ? { ratingValue: r.ratingValue } : {}),
        comment: r.comment ?? "",
        ...(r.professionalResponse !== null ? { professionalResponse: r.professionalResponse } : {}),
        ...(r.respondedAt ? { respondedAt: r.respondedAt.toISOString() } : {}),
        createdAt: r.createdAt.toISOString(),
      };
    });

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
        coverImage={professional.coverImage}
        headline={headline}
        rating={professional.rating}
        reviewCount={professional.reviewCount}
        verified={professional.verified}
        categoryLabel={CATEGORY_LABELS[category] ?? category}
        {...(professional.yearsExperience !== null ? { yearsExperience: professional.yearsExperience } : {})}
        languages={professional.languages}
        hasAvailability={professional.availability.length > 0}
      />

      {/* Sticky anchor nav */}
      <nav className="sticky top-0 z-30 -mx-4 mt-4 border-b border-stone-200 bg-background/85 px-4 py-2.5 backdrop-blur dark:border-stone-800 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto text-sm font-medium text-stone-600 dark:text-stone-400 no-scrollbar">
          <a href="#about" className="shrink-0 hover:text-teal-600 dark:hover:text-teal-400">Sobre mí</a>
          {headline ? <a href="#specialties" className="shrink-0 hover:text-teal-600 dark:hover:text-teal-400">Especialidades</a> : null}
          {professional.certifications.length > 0 ? <a href="#certifications" className="shrink-0 hover:text-teal-600 dark:hover:text-teal-400">Certificaciones</a> : null}
          <a href="#availability" className="shrink-0 hover:text-teal-600 dark:hover:text-teal-400">Disponibilidad</a>
          <a href="#reviews" className="shrink-0 hover:text-teal-600 dark:hover:text-teal-400">Reseñas</a>
        </div>
      </nav>

      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Bio — pull-quote style */}
            <FadeIn delay={0.1}>
              <section id="about" className="scroll-mt-20">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                    Sobre mí
                  </h2>
                </div>
                {bio ? (
                  (() => {
                    const { lead, rest } = splitBio(bio);
                    return (
                      <div className="space-y-4">
                        <blockquote className="relative rounded-2xl border-l-4 border-teal-500 bg-stone-50 px-5 py-4 dark:border-teal-400 dark:bg-stone-800/50">
                          <Quote className="absolute -top-3 left-4 h-5 w-5 rounded-full bg-teal-500 p-1 text-white" aria-hidden="true" />
                          <p className="font-display text-lg italic leading-snug text-stone-800 dark:text-stone-100 sm:text-xl">
                            {lead}
                          </p>
                        </blockquote>
                        {rest && (
                          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                            {rest}
                          </p>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-base leading-relaxed text-stone-500 italic dark:text-stone-500">
                    Este profesional aún no ha añadido una biografía.
                  </p>
                )}
              </section>
            </FadeIn>

            {/* Specialties — visual cards */}
            {headline && (() => {
              const specialties = headline
                .split("·")
                .map((tag) => tag.trim())
                .filter(Boolean);
              if (specialties.length === 0) return null;
              return (
                <FadeIn delay={0.12}>
                  <section id="specialties" className="scroll-mt-20">
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                      <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                        Especialidades
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {specialties.map((tag) => {
                        const Icon = pickSpecialtyIcon(tag);
                        return (
                          <div
                            key={tag}
                            className="group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-teal-300 hover:bg-teal-50/40 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-teal-700 dark:hover:bg-teal-900/10"
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 transition-colors group-hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300">
                              <Icon className="h-5 w-5" />
                            </span>
                            <p className="mt-1 font-display font-semibold leading-tight text-stone-900 dark:text-stone-50">
                              {tag}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </FadeIn>
              );
            })()}

            {/* Certifications — horizontal carousel */}
            {professional.certifications.length > 0 && (
              <FadeIn delay={0.14}>
                <section id="certifications" className="scroll-mt-20">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="h-4 w-0.5 rounded-full bg-teal-500 shrink-0" />
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-50">
                      Certificaciones
                    </h2>
                  </div>
                  <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
                    {professional.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex w-[260px] shrink-0 snap-start items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 sm:w-[280px]"
                      >
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                          <GraduationCap className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-display font-semibold leading-tight text-stone-900 dark:text-stone-50">
                            {cert.title}
                          </p>
                          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            {cert.institution}
                            {cert.year ? ` · ${cert.year}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            {/* Availability */}
            <FadeIn delay={0.15}>
              <section id="availability" className="scroll-mt-20">
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
              </section>
            </FadeIn>

            {/* Reviews — ReviewsSection provides its own header + rating summary */}
            <FadeIn delay={0.2}>
              <section id="reviews" className="scroll-mt-20">
                <ReviewsSection
                  reviews={reviews}
                  rating={professional.rating}
                  reviewCount={professional.reviewCount}
                />
              </section>
            </FadeIn>
          </div>

          {/* ── Right column — sticky ── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
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
