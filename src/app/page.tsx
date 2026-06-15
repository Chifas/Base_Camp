import { Suspense } from "react";
import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { Stats } from "@/components/landing/stats";
import { Categories } from "@/components/landing/categories";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FreemiumModel } from "@/components/landing/freemium-model";
import { UseCases } from "@/components/landing/use-cases";
import { ProductDemo } from "@/components/landing/product-demo";
import { Comparison } from "@/components/landing/comparison";
import { FaqInline } from "@/components/landing/faq-inline";
import { Resources } from "@/components/landing/resources";
import { Waitlist } from "@/components/landing/waitlist";
import { StickyCta } from "@/components/landing/sticky-cta";
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
      <TrustBar />
      <Stats />
      <FreemiumModel />
      <Categories />
      <UseCases />
      <ProductDemo />
      <HowItWorks />
      <Suspense fallback={<FeaturedProfessionalsSkeleton />}>
        <AsyncFeaturedProfessionals />
      </Suspense>
      <Testimonials />
      <Comparison />
      <Resources />
      <FaqInline />
      <Waitlist />
      <CTA />
      <StickyCta />
    </>
  );
}
