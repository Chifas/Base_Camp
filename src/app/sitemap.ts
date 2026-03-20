import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://guidepath.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Category landing pages
  const categoryPages: MetadataRoute.Sitemap = [
    "mentor-de-carrera",
    "coach",
    "psicologo-laboral",
    "nutricionista",
  ].map((slug) => ({
    url: `${siteUrl}/categoria/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Dynamic professional profiles
  let professionalPages: MetadataRoute.Sitemap = [];
  try {
    const professionals = await prisma.professionalProfile.findMany({
      select: { id: true, updatedAt: true },
    });
    professionalPages = professionals.map((p) => ({
      url: `${siteUrl}/professional/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // If DB is unavailable, return static pages only
  }

  return [...staticPages, ...categoryPages, ...professionalPages];
}
