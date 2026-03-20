"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Star, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBg } from "@/components/shared/animated-gradient-bg";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Animated background */}
      <AnimatedGradientBg />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 w-full">
        <div className="mx-auto max-w-4xl text-center">
          {/* Animated trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:border-primary/40 group cursor-default">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-muted-foreground">
                Plataforma líder en orientación profesional
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Headline — bigger, bolder */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Encuentra{" "}
            <span className="text-gradient">tu camino</span>
            <br />
            <span className="text-[0.85em]">
              con quien te{" "}
              <RotatingWords
                words={["guíe", "inspire", "impulse", "acompañe"]}
                className="text-gradient"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            Conectamos profesionales con coaches y mentores especializados en
            desarrollo de carrera, liderazgo y emprendimiento.{" "}
            <span className="text-foreground font-medium">
              Sesiones por videollamada, cuando tú quieras.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto group btn-glow !bg-zinc-900 !text-white hover:!bg-zinc-800 dark:!bg-white dark:!text-zinc-900 dark:hover:!bg-zinc-100 h-12 px-8 text-base"
              asChild
            >
              <Link href="/explore">
                Explorar profesionales
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto !border-zinc-900/30 !bg-transparent !text-zinc-900 hover:!bg-zinc-900/10 dark:!border-white/30 dark:!text-white dark:hover:!bg-white/10 h-12 px-8 text-base"
              asChild
            >
              <Link href="#como-funciona">
                <Play className="mr-2 h-4 w-4" />
                Cómo funciona
              </Link>
            </Button>
          </motion.div>

          {/* Social proof stats — redesigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 grid grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              { icon: Users, target: 2500, suffix: "+", label: "Profesionales acelerados", decimals: 0 },
              { icon: Shield, target: 150, suffix: "+", label: "Mentores y coaches", decimals: 0 },
              { icon: Star, target: 4.8, suffix: "", label: "Valoración media", decimals: 1 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="group relative rounded-2xl border bg-background/70 backdrop-blur-md p-4 sm:p-6 transition-all duration-300 hover:bg-background/90 shadow-sm hover:shadow-lg dark:bg-background/60 dark:hover:bg-background/80 dark:hover:shadow-md"
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="font-heading text-2xl font-bold sm:text-3xl lg:text-4xl">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} decimals={stat.decimals} />
                  </span>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
