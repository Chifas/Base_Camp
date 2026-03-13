import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16 sm:py-24">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
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
                  className="w-full sm:w-auto group"
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
