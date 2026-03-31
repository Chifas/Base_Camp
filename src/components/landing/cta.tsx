"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion-wrapper";

export function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl bg-primary px-8 py-16 text-center sm:px-16 sm:py-20">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              ¿Listo para dar el siguiente paso?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Reserva tu primera sesión gratuita y empieza a construir la
              carrera que mereces.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="w-full sm:w-auto group !bg-white !text-primary hover:!bg-white/90 h-12 px-8 text-base font-semibold"
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
                className="w-full sm:w-auto !border-white/30 !text-white !bg-white/10 hover:!bg-white/20 h-12 px-8 text-base"
                asChild
              >
                <Link href="/explore">Explorar profesionales</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
