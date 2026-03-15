"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/motion-wrapper";
import type { Professional } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface FeaturedProfessionalsProps {
  professionals: Professional[];
}

export function FeaturedProfessionals({ professionals }: FeaturedProfessionalsProps) {
  const featured = professionals;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Profesionales destacados
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Los mejores profesionales te esperan
            </h2>
          </div>
          <Button variant="ghost" className="hidden md:flex group" asChild>
            <Link href="/explore">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </FadeIn>

        <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((pro) => (
            <StaggerItem key={pro.id}>
              <Link
                href={`/professional/${pro.id}`}
                className="group block"
              >
                <div className="glass relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 card-glow">
                  {/* Image with parallax hover */}
                  <motion.div
                    className="relative aspect-[4/5] overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  >
                    <Image
                      src={pro.image}
                      alt={pro.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent transition-all duration-500 group-hover:from-black/80" />

                    {/* Badge overlay */}
                    <div className="absolute left-3 top-3">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                        {pro.categoryName}
                      </Badge>
                    </div>

                    {/* Verified badge */}
                    {pro.verified && (
                      <div className="absolute right-3 top-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    )}

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading text-lg font-semibold text-white">
                        {pro.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-white/80 line-clamp-1">
                        {pro.headline}
                      </p>
                    </div>
                  </motion.div>

                  {/* Card bottom */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.4)]" />
                      <span className="text-sm font-medium">{pro.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({pro.reviewCount})
                      </span>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary transition-transform duration-200 group-hover:scale-105 origin-right">
                      {formatCurrency(pro.hourlyRate)}
                      <span className="text-xs font-normal text-muted-foreground">
                        /h
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mobile view all button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/explore">
              Ver todos los profesionales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
