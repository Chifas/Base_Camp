import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, type ProfessionalCategory } from "@/types";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const professional = await prisma.professionalProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, image: true, bio: true } },
    },
  });

  if (!professional) {
    return { title: "Profesional no encontrado | GuidePath" };
  }

  const name = professional.user.name ?? "Profesional";
  const category =
    CATEGORY_LABELS[professional.category as ProfessionalCategory] ??
    professional.category;
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
  };
}

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
