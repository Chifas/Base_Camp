"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBg } from "@/components/shared/animated-gradient-bg";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background */}
      <AnimatedGradientBg />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm transition-colors hover:border-primary/40">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                <Shield className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-muted-foreground">
                Mentores del mundo empresarial verificados
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Encuentra{" "}
            <span className="text-gradient">tu camino</span>
            <br />
            con quien te{" "}
            <RotatingWords
              words={["guíe", "inspire", "impulse", "acompañe"]}
              className="text-gradient"
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Conectamos profesionales con coaches y mentores especializados en desarrollo de carrera, liderazgo y emprendimiento. Sesiones por videollamada, cuando tú quieras.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="w-full sm:w-auto group btn-glow !bg-zinc-900 !text-white hover:!bg-zinc-800 dark:!bg-white dark:!text-zinc-900 dark:hover:!bg-zinc-100" asChild>
              <Link href="/explore">
                Explorar profesionales
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto !border-zinc-900/30 !bg-transparent !text-zinc-900 hover:!bg-zinc-900/10 dark:!border-white/30 dark:!text-white dark:hover:!bg-white/10"
              asChild
            >
              <Link href="#como-funciona">
                <Play className="mr-2 h-4 w-4" />
                Cómo funciona
              </Link>
            </Button>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t pt-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  <AnimatedCounter target={2500} suffix="+" />
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Profesionales acelerados
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  <AnimatedCounter target={150} suffix="+" />
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Mentores y coaches
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  <AnimatedCounter target={4.8} decimals={1} />
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Valoración media
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
