"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-heading text-2xl font-bold">
        Error en la sesión
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        No se pudo conectar a la videollamada. Comprueba tu conexión, cámara y micrófono.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} variant="default">
          Reintentar conexión
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/client">Volver al panel</Link>
        </Button>
      </div>
    </div>
  );
}
