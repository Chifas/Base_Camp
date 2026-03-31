"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background — clean gradient, no blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-background dark:to-background" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pb-32 lg:pt-40">
        {/* Centered single-column layout */}
        <div className="text-center">
          {/* Simple trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              3 sesiones gratuitas al mes
            </span>
          </motion.div>

          {/* Headline — large, clean, confident */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Tu carrera merece{" "}
            <span className="text-primary">orientación profesional</span>
          </motion.h1>

          {/* Subtitle — clear and concise */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Conecta con coaches, mentores y psicólogos laborales verificados.
            Sesiones por videollamada, gratis, sin compromiso.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold"
              asChild
            >
              <Link href="/explore">
                Explorar profesionales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base"
              asChild
            >
              <Link href="#como-funciona">Cómo funciona</Link>
            </Button>
          </motion.div>

          {/* Trust stats — simple, inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mx-auto mt-14 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">2.500+</strong> profesionales guiados</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">150+</strong> expertos verificados</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">4.8</strong> valoración media</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
