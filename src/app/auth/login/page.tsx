"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthAside } from "@/components/auth/auth-aside";

const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const OAUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked:
    "Este email ya está registrado con contraseña. Inicia sesión con email y contraseña.",
  OAuthSignin: "Error al iniciar sesión con Google. Inténtalo de nuevo.",
  OAuthCallback: "Error al conectar con Google. Inténtalo de nuevo.",
  Default: "Ha ocurrido un error. Inténtalo de nuevo.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(
    oauthError ? (OAUTH_ERRORS[oauthError] ?? OAUTH_ERRORS.Default) : ""
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginFormData) {
    setServerError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setServerError("Email o contraseña incorrectos.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const userRole = sessionData?.user?.role ?? "CLIENT";
    router.push(
      userRole === "PROFESSIONAL"
        ? "/dashboard/professional"
        : "/dashboard/client"
    );
    router.refresh();
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1400px] grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-12 lg:gap-6 lg:p-8">
      {/* Left — dark aurora bento */}
      <AuthAside
        eyebrow="Bienvenido de nuevo"
        title={
          <>
            Vuelve a tu <span className="text-gradient-on-dark">camino</span>
          </>
        }
        subtitle="Accede a tu dashboard, retoma tus sesiones y sigue aprendiendo con los mejores profesionales."
      />

      {/* Right — form card */}
      <section className="flex items-center justify-center lg:col-span-7">
        <div className="w-full max-w-md rounded-3xl border bg-card/70 p-7 shadow-xl backdrop-blur-xl sm:p-10">
          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Iniciar sesión
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Hola otra vez
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Introduce tus credenciales o continúa con Google.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Google OAuth */}
            <Button
              variant="outline"
              className="w-full rounded-full"
              size="lg"
              onClick={() =>
                signIn("google", { callbackUrl: "/auth/complete-profile" })
              }
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.2em]">
                <span className="bg-card px-3 text-muted-foreground">
                  O con email
                </span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`h-11 rounded-xl pl-10 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    ¿La olvidaste?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-11 rounded-xl pl-10 pr-10 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:underline"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

