import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | GuidePath",
  description:
    "Accede a tu cuenta de GuidePath para conectar con profesionales certificados.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
