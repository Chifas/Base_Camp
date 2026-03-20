"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Star, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/shared/motion-wrapper";
import type { Professional } from "@/types";

interface FeaturedProfessionalsProps {
  professionals: Professional[];
}

export function FeaturedProfessionals({ professionals }: FeaturedProfessionalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth ?? 300;
    el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
  };

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
          <div className="hidden md:flex items-center gap-2">
            {/* Navigation arrows */}
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm transition-all hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm transition-all hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <Button variant="ghost" className="group ml-2" asChild>
              <Link href="/explore">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="relative mt-12">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-4 no-scrollbar"
        >
          {professionals.map((pro, index) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-[280px] sm:w-[300px] shrink-0"
            >
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
                      sizes="300px"
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
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Gratuito
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile view all button */}
      <div className="mt-8 text-center md:hidden px-4">
        <Button variant="outline" asChild>
          <Link href="/explore">
            Ver todos los profesionales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
