"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SaveProfessionalButtonProps {
  professionalId: string;
  initialSaved?: boolean;
  /** "icon" = just heart, "pill" = heart + label */
  variant?: "icon" | "pill";
  className?: string;
}

export function SaveProfessionalButton({
  professionalId,
  initialSaved = false,
  variant = "icon",
  className = "",
}: SaveProfessionalButtonProps) {
  const { data: authSession } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!authSession?.user) {
      router.push("/auth/login?next=/explore");
      return;
    }

    startTransition(async () => {
      const prev = saved;
      setSaved(!prev);
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professionalId }),
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
        toast.success(data.saved ? "Guardado en favoritos" : "Eliminado de favoritos", {
          duration: 2000,
        });
      } catch {
        setSaved(prev);
        toast.error("No se pudo actualizar favoritos");
      }
    });
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={saved ? "Eliminar de guardados" : "Guardar profesional"}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 disabled:opacity-60 ${
          saved
            ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
            : "border-stone-200 bg-white text-stone-600 hover:border-rose-300 hover:text-rose-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
        } ${className}`}
      >
        <Heart
          className={`h-4 w-4 transition-all ${saved ? "fill-rose-500 text-rose-500" : "fill-none"}`}
        />
        {saved ? "Guardado" : "Guardar"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Eliminar de guardados" : "Guardar profesional"}
      aria-pressed={saved}
      className={`flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-1 disabled:opacity-60 ${
        saved
          ? "text-rose-500 hover:text-rose-600"
          : "text-stone-400 hover:text-rose-500"
      } ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-200 ${
          saved ? "fill-rose-500 scale-110" : "fill-none scale-100"
        }`}
      />
    </button>
  );
}
