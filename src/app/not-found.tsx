import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
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
