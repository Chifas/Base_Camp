"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Headphones,
  Wifi,
  Camera,
} from "lucide-react";

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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Glass card */}
        <div className="glass rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-8 shadow-xl">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          {/* Title and description */}
          <h1 className="mt-6 text-center font-heading text-2xl font-bold text-zinc-900 dark:text-white">
            Error en la videollamada
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            No se pudo establecer la conexión con la sala de videollamada.
            Esto puede deberse a un problema temporal.
          </p>

          {/* Troubleshooting tips */}
          <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Comprueba lo siguiente:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Wifi className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                Tu conexión a internet funciona correctamente
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Camera className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                Tu navegador tiene permiso para usar la cámara y el micrófono
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Headphones className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                Tu dispositivo de audio está conectado y funcionando
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={reset}
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar conexión
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/client">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al dashboard
              </Link>
            </Button>
          </div>

          {/* Support info */}
          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Si el problema persiste, contacta con nuestro equipo de soporte en{" "}
              <a
                href="mailto:soporte@guidepath.dev"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                soporte@guidepath.dev
              </a>
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Código de error: {error.digest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
