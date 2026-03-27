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
import { TrustBar } from "@/components/landing/trust-bar";
import { WaveDivider } from "@/components/shared/wave-divider";
import { getFeaturedProfessionals } from "@/lib/professionals";

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

async function AsyncFeaturedProfessionals() {
  const professionals = await getFeaturedProfessionals();
  return <FeaturedProfessionals professionals={professionals} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Categories />
      <HowItWorks />
      <WaveDivider />
      <Suspense fallback={<FeaturedProfessionalsSkeleton />}>
        <AsyncFeaturedProfessionals />
      </Suspense>
      <WaveDivider inverted />
      <Testimonials />
      <CTA />
    </>
  );
}
