import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { Categories } from "@/components/landing/categories";
import { HowItWorks } from "@/components/landing/how-it-works";
import {
  FeaturedProfessionals,
  FeaturedProfessionalsSkeleton,
} from "@/components/landing/featured-professionals";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { getFeaturedProfessionals } from "@/lib/professionals";

export const metadata: Metadata = {
  title: "GuidePath — Orientación profesional con expertos verificados",
  description:
    "Conecta con coaches, mentores y psicólogos laborales certificados. Sesiones por videollamada, gratis, sin compromiso.",
  openGraph: {
    title: "GuidePath — Orientación profesional con expertos verificados",
    description:
      "Conectamos profesionales con coaches, mentores y psicólogos laborales certificados.",
    siteName: "GuidePath",
    type: "website",
    locale: "es_ES",
  },
};

async function AsyncFeaturedProfessionals() {
  const professionals = await getFeaturedProfessionals();
  return <FeaturedProfessionals professionals={professionals} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <Suspense fallback={<FeaturedProfessionalsSkeleton />}>
        <AsyncFeaturedProfessionals />
      </Suspense>
      <Testimonials />
      <CTA />
    </>
  );
}
