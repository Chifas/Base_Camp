"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function PageError({
  title = "Algo ha salido mal",
  description = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-destructive/60" />
      <h2 className="mt-4 font-heading text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
