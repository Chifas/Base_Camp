"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, source: "landing" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al unirte a la lista");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
              Newsletter quincenal
            </div>

            <h2 className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
              Una guía nueva en tu email cada 15 días
            </h2>
            <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
              Artículos, plantillas y conversaciones con profesionales de nuestra red.
              Sin spam, solo recursos útiles para tu carrera.
            </p>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-col items-center gap-3"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-semibold">
                    ¡Te has suscrito!
                  </p>
                  <p className="text-muted-foreground">
                    El primer recurso llega a tu email en menos de 24h.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="mt-8"
                >
                  <div className="glass mx-auto max-w-md rounded-2xl p-6">
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Tu nombre (opcional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                      />
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          required
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="mt-2 text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="mt-4 w-full"
                      size="lg"
                      disabled={loading || !email}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Suscribiéndote...
                        </>
                      ) : (
                        "Suscribirme"
                      )}
                    </Button>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Sin spam. Cancela cuando quieras con un click.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
