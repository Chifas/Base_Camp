import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta | GuidePath",
  description:
    "Regístrate en GuidePath como cliente o profesional. Conecta con psicólogos, coaches, mentores y nutricionistas.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
