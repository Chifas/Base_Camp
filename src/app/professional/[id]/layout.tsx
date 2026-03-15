import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, image: true, bio: true } },
      category: true,
    },
  });

  if (!professional) {
    return { title: "Profesional no encontrado | GuidePath" };
  }

  const name = professional.user.name ?? "Profesional";
  const category = professional.category.name;
  const description = professional.user.bio
    ? professional.user.bio.slice(0, 160)
    : `${name} — ${category} en GuidePath`;

  return {
    title: `${name} — ${category} | GuidePath`,
    description,
    openGraph: {
      title: `${name} — ${category} | GuidePath`,
      description,
      images: professional.user.image
        ? [
            {
              url: professional.user.image,
              width: 400,
              height: 400,
              alt: name,
            },
          ]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${name} — ${category} | GuidePath`,
      description,
      ...(professional.user.image && { images: [professional.user.image] }),
    },
  };
}

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
