"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  /** CSS selector del elemento a destacar, o null para tarjeta centrada */
  target: string | null;
  title: string;
  description: string;
}

interface OnboardingTourProps {
  /** Clave en localStorage para recordar que el tour ya se completó */
  storageKey: string;
  steps: TourStep[];
  /** Callback opcional al terminar */
  onComplete?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // padding del anillo alrededor del target

export function OnboardingTour({
  storageKey,
  steps,
  onComplete,
}: OnboardingTourProps) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const measureRef = useRef<(() => void) | null>(null);

  // Mostrar solo la primera vez
  useEffect(() => {
    if (!localStorage.getItem(storageKey)) setActive(true);
  }, [storageKey]);

  const step = steps[index];

  // Medir posición del target en cada paso
  useEffect(() => {
    if (!active) return;

    const measure = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        setTargetRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: r.top + window.scrollY,
        left: r.left,
        width: r.width,
        height: r.height,
      });
      // Scroll suave al elemento
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };

    measureRef.current = measure;
    measure();

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [active, index, step.target]);

  const complete = useCallback(() => {
    localStorage.setItem(storageKey, "1");
    setActive(false);
    onComplete?.();
  }, [storageKey, onComplete]);

  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else complete();
  }, [index, steps.length, complete]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  if (!active) return null;

  const isLast = index === steps.length - 1;
  const isCentered = !step.target || !targetRect;

  // Calcular posición de la tarjeta tooltip
  let cardStyle: React.CSSProperties = {};
  if (!isCentered && targetRect) {
    const CARD_HEIGHT = 220;
    const GAP = 16;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;

    const spaceBelow = viewportHeight - (targetRect.top - scrollY + targetRect.height);
    const spaceAbove = targetRect.top - scrollY;

    if (spaceBelow >= CARD_HEIGHT + GAP) {
      // Mostrar debajo
      cardStyle = {
        top: targetRect.top + targetRect.height + GAP,
        left: "50%",
        transform: "translateX(-50%)",
      };
    } else if (spaceAbove >= CARD_HEIGHT + GAP) {
      // Mostrar arriba
      cardStyle = {
        top: targetRect.top - CARD_HEIGHT - GAP,
        left: "50%",
        transform: "translateX(-50%)",
      };
    } else {
      // Fallback: parte baja de la pantalla
      cardStyle = {
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
  }

  return (
    <>
      {/* Capa oscura de fondo */}
      <div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[1px]"
        onClick={complete}
      />

      {/* Anillo sobre el elemento destacado */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            key={`ring-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed z-[81] rounded-xl ring-2 ring-indigo-500 ring-offset-1"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left - PAD,
              width: targetRect.width + PAD * 2,
              height: targetRect.height + PAD * 2,
              boxShadow: "0 0 0 4px rgba(99,102,241,0.15), 0 0 24px 8px rgba(99,102,241,0.2)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Tarjeta del tour */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`card-${index}`}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={[
            "fixed z-[82] w-[calc(100vw-32px)] max-w-sm rounded-2xl border bg-card px-5 py-5 shadow-2xl",
            isCentered ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "",
          ].join(" ")}
          style={isCentered ? {} : cardStyle}
        >
          {/* Cabecera: contador + botón cerrar */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-muted-foreground">
                {index + 1} de {steps.length}
              </span>
            </div>
            <button
              onClick={complete}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar guía"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mb-4 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1 rounded-full transition-all duration-300",
                  i === index
                    ? "w-6 bg-indigo-500"
                    : i < index
                    ? "w-2 bg-indigo-300 dark:bg-indigo-700"
                    : "w-2 bg-muted-foreground/20",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Contenido */}
          <h3 className="font-heading text-base font-semibold leading-snug">
            {step.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </p>

          {/* Navegación */}
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={complete}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Omitir guía
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <Button variant="outline" size="sm" onClick={prev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" onClick={next}>
                {isLast ? (
                  "¡Empezar!"
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/** Botón para relanzar el tour (útil en settings o navbar) */
export function RestartTourButton({
  storageKey,
  label = "Ver guía",
}: {
  storageKey: string;
  label?: string;
}) {
  return (
    <button
      onClick={() => {
        localStorage.removeItem(storageKey);
        window.location.reload();
      }}
      className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
