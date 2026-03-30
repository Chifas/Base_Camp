"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Star, Users, Sparkles, Video, Clock, Mic, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedGradientBg } from "@/components/shared/animated-gradient-bg";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { RotatingWords } from "@/components/shared/rotating-words";

function SessionMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="relative"
    >
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />

      {/* Card principal */}
      <div className="relative rounded-2xl border border-border/60 bg-background/80 p-6 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Ana García</p>
              <p className="text-xs text-muted-foreground">Executive Coach · ICF</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 border border-green-500/20">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">En curso</span>
          </div>
        </div>

        {/* Video area — two participants */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-950 to-purple-950 py-6 px-4">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 40%, #6366f1 0%, transparent 60%), radial-gradient(circle at 70% 60%, #8b5cf6 0%, transparent 60%)",
            }}
          />

          {/* Timer pill */}
          <div className="relative flex justify-center mb-5">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/10">
              <Clock className="h-3 w-3 text-white/70" />
              <span className="text-xs font-medium text-white/80 tabular-nums">34:12</span>
            </div>
          </div>

          {/* Participants */}
          <div className="relative flex items-center justify-center gap-6">
            {/* Professional */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-2 border-white/20"
              >
                <span className="text-lg font-bold text-white">AG</span>
              </motion.div>
              <div className="flex items-center gap-1.5">
                <Mic className="h-3 w-3 text-white/50" />
                <span className="text-xs text-white/70">Ana G.</span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-white/20" />

            {/* You */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-2 border-white/20"
              >
                <User className="h-7 w-7 text-white" />
              </motion.div>
              <div className="flex items-center gap-1.5">
                <Mic className="h-3 w-3 text-white/50" />
                <span className="text-xs text-white/70">Tú</span>
              </div>
            </div>
          </div>

          {/* Call controls */}
          <div className="relative flex items-center justify-center gap-3 mt-5">
            {[
              { icon: Mic, bg: "bg-white/10 hover:bg-white/20", color: "text-white/80" },
              { icon: Video, bg: "bg-white/10 hover:bg-white/20", color: "text-white/80" },
              { icon: PhoneOff, bg: "bg-red-500/20 hover:bg-red-500/30", color: "text-red-400" },
            ].map((ctrl, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${ctrl.bg} backdrop-blur-sm cursor-default transition-colors`}
              >
                <ctrl.icon className={`h-3.5 w-3.5 ${ctrl.color}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center">
      {/* Animated background */}
      <AnimatedGradientBg />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 w-full">
        {/* Desktop: 2-col grid. Mobile: single column centered */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left column — text content */}
          <div className="text-center lg:text-left">
            {/* Animated trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:border-primary/40 group cursor-default">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
                <span className="text-muted-foreground">
                  ✦ Primera sesión gratuita · Sin tarjeta de crédito
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
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
              className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed lg:mx-0"
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
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
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

            {/* Social proof stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 grid grid-cols-3 gap-4"
            >
              {[
                { icon: Users, target: 2500, suffix: "+", label: "Profesionales acelerados", decimals: 0 },
                { icon: Shield, target: 150, suffix: "+", label: "Mentores y coaches", decimals: 0 },
                { icon: Star, target: 4.8, suffix: "", label: "Valoración media", decimals: 1 },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  className="group relative rounded-2xl border bg-background/70 backdrop-blur-md p-4 sm:p-5 transition-all duration-300 hover:bg-background/90 shadow-sm hover:shadow-lg dark:bg-background/60"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <stat.icon className="h-5 w-5 text-primary mb-1" />
                    <span className="font-heading text-2xl font-bold sm:text-3xl">
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

          {/* Right column — session mockup (only on desktop) */}
          <div className="hidden lg:block">
            <SessionMockup />
          </div>
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
