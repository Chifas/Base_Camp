"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                <Shield className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-muted-foreground">
                Profesionales verificados y certificados
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Encuentra{" "}
            <span className="text-primary">tu camino</span>
            <br />
            con quien te guíe
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Conectamos personas que buscan orientación con psicólogos, coaches,
            mentores y nutricionistas. Sesiones por videollamada, desde la
            comodidad de tu hogar.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="w-full sm:w-auto group" asChild>
              <Link href="/explore">
                Explorar profesionales
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t pt-8"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  2.500+
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Clientes satisfechos
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  150+
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Profesionales verificados
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-heading text-2xl font-bold sm:text-3xl">
                  4.8
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
