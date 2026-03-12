import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorar Profesionales | GuidePath",
  description:
    "Encuentra psicólogos, coaches, mentores de carrera y nutricionistas certificados. Filtra por categoría, precio y valoraciones.",
  openGraph: {
    title: "Explorar Profesionales | GuidePath",
    description:
      "Encuentra psicólogos, coaches, mentores y nutricionistas certificados en GuidePath.",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
