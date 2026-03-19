import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-2">
        <Image src="/logo.svg" alt="GuidePath" width={140} height={126} className="mx-auto drop-shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
      </div>
      <p className="mt-6 font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="mt-2 font-heading text-2xl font-bold">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        La página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
