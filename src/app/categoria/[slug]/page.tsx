import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CategoryHero,
  CategoryDescription,
  CategoryProfessionals,
  CategoryCTA,
} from "./category-sections";
import type { ProfessionalCardData } from "./category-sections";

// ── Category data ───────────────────────────────────────────────────────────

interface CategoryPageData {
  enumValue: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
  keywords: string[];
}

const CATEGORIES_DATA: Record<string, CategoryPageData> = {
  "mentor-de-carrera": {
    enumValue: "CAREER_MENTOR",
    title: "Mentores de Carrera",
    subtitle: "Impulsa tu trayectoria profesional con orientación experta",
    description:
      "Nuestros mentores de carrera te ayudan a navegar transiciones laborales, definir tu camino profesional y alcanzar tus metas. Con experiencia real en el mercado laboral, te ofrecen perspectiva y estrategias personalizadas.",
    benefits: [
      "Planificación de carrera personalizada",
      "Preparación para entrevistas y negociación salarial",
      "Estrategias de networking efectivo",
      "Transiciones de carrera exitosas",
    ],
    icon: "Compass",
    color: "indigo",
    keywords: [
      "mentor carrera",
      "orientación profesional",
      "desarrollo carrera",
      "transición laboral",
    ],
  },
  coach: {
    enumValue: "COACH",
    title: "Coaches Ejecutivos",
    subtitle: "Desarrolla tu liderazgo y potencial profesional",
    description:
      "Nuestros coaches ejecutivos te acompañan en el desarrollo de habilidades de liderazgo, gestión de equipos y toma de decisiones estratégicas. Transforma tu estilo de gestión con sesiones personalizadas.",
    benefits: [
      "Desarrollo de liderazgo auténtico",
      "Gestión de equipos de alto rendimiento",
      "Inteligencia emocional en el trabajo",
      "Estrategias de comunicación ejecutiva",
    ],
    icon: "Target",
    color: "violet",
    keywords: [
      "coach ejecutivo",
      "coaching liderazgo",
      "desarrollo profesional",
      "gestión equipos",
    ],
  },
  "psicologo-laboral": {
    enumValue: "PSYCHOLOGIST",
    title: "Psicólogos Laborales",
    subtitle: "Cuida tu bienestar emocional en el entorno profesional",
    description:
      "Nuestros psicólogos laborales te ayudan a gestionar el estrés, prevenir el burnout y mejorar tu bienestar en el trabajo. Aborda conflictos laborales y encuentra el equilibrio que necesitas.",
    benefits: [
      "Gestión del estrés y ansiedad laboral",
      "Prevención y recuperación del burnout",
      "Resolución de conflictos en el trabajo",
      "Equilibrio vida personal-profesional",
    ],
    icon: "Brain",
    color: "emerald",
    keywords: [
      "psicólogo laboral",
      "burnout",
      "estrés laboral",
      "bienestar trabajo",
    ],
  },
  nutricionista: {
    enumValue: "NUTRITIONIST",
    title: "Nutricionistas",
    subtitle: "Mejora tu alimentación para rendir al máximo",
    description:
      "Nuestros nutricionistas diseñan planes alimentarios adaptados a tu ritmo de vida profesional. Optimiza tu energía, concentración y rendimiento con una nutrición inteligente.",
    benefits: [
      "Planes nutricionales personalizados",
      "Alimentación para alto rendimiento",
      "Gestión del peso saludable",
      "Nutrición para gestión del estrés",
    ],
    icon: "Apple",
    color: "orange",
    keywords: [
      "nutricionista online",
      "nutrición profesional",
      "plan alimentario",
      "salud alimentaria",
    ],
  },
};

const ALL_SLUGS = Object.keys(CATEGORIES_DATA);

// ── Static params (pre-render all 4 categories) ────────────────────────────

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

// ── Dynamic SEO metadata ────────────────────────────────────────────────────

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://guidepath.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = CATEGORIES_DATA[params.slug];
  if (!data) return {};

  const title = `${data.title} — GuidePath`;
  const description = data.description;

  return {
    title,
    description,
    keywords: data.keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/categoria/${params.slug}`,
      type: "website",
      locale: "es_ES",
      siteName: "GuidePath",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${data.title} en GuidePath`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${siteUrl}/categoria/${params.slug}`,
    },
  };
}

// ── Page component (server) ─────────────────────────────────────────────────

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = CATEGORIES_DATA[params.slug];
  if (!data) notFound();

  // Fetch featured professionals from the database
  let professionals: ProfessionalCardData[] = [];
  let professionalCount = 0;

  try {
    const [profiles, count] = await Promise.all([
      prisma.professionalProfile.findMany({
        where: {
          category: data.enumValue as "CAREER_MENTOR" | "COACH" | "PSYCHOLOGIST" | "NUTRITIONIST",
          onboardingDone: true,
        },
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        take: 6,
        orderBy: { rating: "desc" },
      }),
      prisma.professionalProfile.count({
        where: {
          category: data.enumValue as "CAREER_MENTOR" | "COACH" | "PSYCHOLOGIST" | "NUTRITIONIST",
          onboardingDone: true,
        },
      }),
    ]);

    professionals = profiles.map((p) => ({
      id: p.id,
      name: p.user.name ?? "Profesional",
      image: p.user.image,
      headline: p.headline,
      rating: p.rating,
      reviewCount: p.reviewCount,
      verified: p.verified,
    }));

    professionalCount = count;
  } catch {
    // If DB is unavailable, show the page without professionals
  }

  return (
    <>
      {/* Hero */}
      <CategoryHero
        title={data.title}
        subtitle={data.subtitle}
        icon={data.icon}
        color={data.color}
        professionalCount={professionalCount}
      />

      {/* Description + Benefits */}
      <CategoryDescription
        description={data.description}
        benefits={data.benefits}
        color={data.color}
      />

      {/* Featured professionals */}
      <CategoryProfessionals
        professionals={professionals}
        title={data.title}
        color={data.color}
      />

      {/* CTA */}
      <CategoryCTA
        title={data.title}
        slug={data.enumValue}
        color={data.color}
      />
    </>
  );
}
