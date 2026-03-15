import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl cta-gradient px-8 py-16 text-center sm:px-16 sm:py-24">
            {/* Pulsating glow border */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-primary via-violet-500 to-primary opacity-20 blur-sm animate-pulse-glow" />

            {/* Animated background decorations */}
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                ¿Listo para dar el siguiente paso en tu carrera?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Conecta con el mentor o coach que necesitas. Reserva tu primera sesión hoy y empieza a construir la carrera que mereces.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto group shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-shadow"
                  asChild
                >
                  <Link href="/auth/register">
                    Empezar gratis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  asChild
                >
                  <Link href="/explore">Explorar profesionales</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
