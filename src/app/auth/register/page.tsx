"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, User, Loader2, Briefcase, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"CLIENT" | "PROFESSIONAL">("CLIENT");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      router.replace(role === "PROFESSIONAL" ? "/dashboard/professional" : "/dashboard/client");
    }
  }, [status, session, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  async function onSubmit(data: RegisterFormData) {
    setServerError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });
    const resData = await res.json();

    if (!res.ok) {
      setServerError(resData.error ?? "Error al crear la cuenta.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setServerError("Cuenta creada, pero error al iniciar sesión. Inténtalo manualmente.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const userRole = sessionData?.user?.role ?? role;
    setLoading(false);
    router.push(userRole === "PROFESSIONAL" ? "/onboarding/professional" : "/dashboard/client");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] overflow-x-hidden">
      {/* ── Brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-teal-700 p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="GuidePath" width={36} height={32} className="h-8 w-auto brightness-[10]" />
          <span className="font-display text-xl font-bold text-white">GuidePath</span>
        </Link>

        <div className="space-y-8">
          <p className="font-display text-3xl xl:text-4xl font-bold text-white leading-snug">
            La orientación profesional que necesitas, cuando la necesitas.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              "3 sesiones gratuitas al mes, sin tarjeta",
              "Más de 230 profesionales verificados",
              "Videollamada desde cualquier dispositivo",
              "Sin compromisos, cancela cuando quieras",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">© 2026 GuidePath. Todos los derechos reservados.</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden text-center">
            <Image src="/logo.svg" alt="GuidePath" width={48} height={44} className="mx-auto" />
          </div>

          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-50">
            Crea tu cuenta
          </h1>
          <p className="mt-1.5 text-stone-500 dark:text-stone-400">
            Empieza tu camino hacia el bienestar
          </p>

          <div className="mt-8 space-y-5">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-display font-medium transition-all duration-150 ${
                  role === "CLIENT"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                    : "border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600"
                }`}
              >
                <HeartHandshake className={`h-5 w-5 ${role === "CLIENT" ? "text-teal-600" : "text-stone-400"}`} />
                Busco ayuda
              </button>
              <button
                type="button"
                onClick={() => setRole("PROFESSIONAL")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-display font-medium transition-all duration-150 ${
                  role === "PROFESSIONAL"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                    : "border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600"
                }`}
              >
                <Briefcase className={`h-5 w-5 ${role === "PROFESSIONAL" ? "text-teal-600" : "text-stone-400"}`} />
                Soy profesional
              </button>
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("guidepath-pending-role", role);
                signIn("google", { callbackUrl: "/auth/complete-profile" });
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm font-display font-medium text-stone-700 dark:text-stone-300 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Registrarse con Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-stone-400 dark:text-stone-500">
                  O con email
                </span>
              </div>
            </div>

            {/* Registration form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {serverError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    className={`pl-10 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus-visible:ring-teal-500 ${errors.name ? "border-destructive" : ""}`}
                    {...register("name")}
                  />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`pl-10 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus-visible:ring-teal-500 ${errors.email ? "border-destructive" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className={`pl-10 pr-10 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 focus-visible:ring-teal-500 ${errors.password ? "border-destructive" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-display font-semibold transition-transform duration-180 hover:scale-[1.02]"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando cuenta...</>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-stone-400 dark:text-stone-500">
              Al registrarte, aceptas nuestros{" "}
              <Link href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Términos de uso</Link>
              {" "}y{" "}
              <Link href="#" className="text-teal-600 dark:text-teal-400 hover:underline">Política de privacidad</Link>
            </p>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="font-medium text-teal-600 dark:text-teal-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
