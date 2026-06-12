"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gsap, useGSAP } from "@/lib/gsap-config";

const resetPasswordFormSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const card = root.querySelector<HTMLElement>("[data-card]");
      if (card) gsap.from(card, { y: 20, duration: 0.6, ease: "power3.out" });
    },
    { scope: rootRef }
  );

  // Animate success card when it mounts
  useEffect(() => {
    if (!submitted) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = successRef.current;
    if (!node) return;
    gsap.from(node, { scale: 0.95, duration: 0.45, ease: "back.out(1.6)" });
  }, [submitted]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "No se pudo restablecer la contraseña.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div ref={rootRef} className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div data-card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <Image src="/logo.svg" alt="GuidePath" width={140} height={126} className="mx-auto drop-shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            Crea una contraseña nueva
          </h1>
          <p className="mt-2 text-muted-foreground">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <div className="mt-8">
          {!token ? (
            // Missing token — invalid link
            <div className="rounded-xl border bg-card p-6 text-center">
              <h2 className="font-heading text-lg font-semibold">
                Enlace no válido
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Este enlace de recuperación no es válido o está incompleto.
                Solicita uno nuevo desde la página de recuperación.
              </p>
              <Button className="mt-6 w-full" asChild>
                <Link href="/auth/forgot-password">Solicitar nuevo enlace</Link>
              </Button>
            </div>
          ) : submitted ? (
            // Success state
            <div ref={successRef} className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold">
                Contraseña actualizada
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tu contraseña se ha restablecido correctamente. Ya puedes
                iniciar sesión con la nueva contraseña.
              </p>
              <Button className="mt-6 w-full" asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    autoFocus
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                ) : (
                  "Restablecer contraseña"
                )}
              </Button>
            </form>
          )}

          {!submitted && (
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
