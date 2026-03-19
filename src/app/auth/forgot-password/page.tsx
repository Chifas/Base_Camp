"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Simulate API call — replace with real email sending logic
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <Image src="/logo.svg" alt="GuidePath" width={140} height={126} className="mx-auto drop-shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Introduce tu email y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <div className="mt-8">
          {submitted ? (
            // Success state
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold">
                Email enviado
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Si existe una cuenta con <strong>{email}</strong>, recibirás un
                enlace para restablecer tu contraseña en los próximos minutos.
                Revisa también tu carpeta de spam.
              </p>
              <Button className="mt-6 w-full" asChild>
                <Link href="/auth/login">Volver al inicio de sesión</Link>
              </Button>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !email}
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
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
      </motion.div>
    </div>
  );
}
