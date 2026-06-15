"use client";

import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap-config";
import { FadeIn } from "@/components/shared/motion-wrapper";

type Mark = "yes" | "no" | "partial";

const COLUMNS = ["GuidePath", "Mentores sueltos", "Plataformas internacionales", "RRHH interno"] as const;
type ColKey = (typeof COLUMNS)[number];

interface Row {
  feature: string;
  cells: Record<ColKey, { mark: Mark; note?: string }>;
}

const ROWS: Row[] = [
  {
    feature: "Sesiones gratuitas al mes",
    cells: {
      "GuidePath":                   { mark: "yes", note: "3 sesiones" },
      "Mentores sueltos":            { mark: "no",  note: "Pago por hora" },
      "Plataformas internacionales": { mark: "partial", note: "Solo trial" },
      "RRHH interno":                { mark: "yes", note: "Depende empresa" },
    },
  },
  {
    feature: "Profesionales verificados",
    cells: {
      "GuidePath":                   { mark: "yes", note: "Identidad + credenciales" },
      "Mentores sueltos":            { mark: "no" },
      "Plataformas internacionales": { mark: "yes" },
      "RRHH interno":                { mark: "yes" },
    },
  },
  {
    feature: "Cobertura sectorial",
    cells: {
      "GuidePath":                   { mark: "yes", note: "Psicología + carrera + sector" },
      "Mentores sueltos":            { mark: "partial", note: "1-2 áreas" },
      "Plataformas internacionales": { mark: "yes" },
      "RRHH interno":                { mark: "no",  note: "Solo interno" },
    },
  },
  {
    feature: "Confidencialidad total",
    cells: {
      "GuidePath":                   { mark: "yes" },
      "Mentores sueltos":            { mark: "yes" },
      "Plataformas internacionales": { mark: "yes" },
      "RRHH interno":                { mark: "no",  note: "Conflicto de interés" },
    },
  },
  {
    feature: "En español, expertos en España",
    cells: {
      "GuidePath":                   { mark: "yes" },
      "Mentores sueltos":            { mark: "yes" },
      "Plataformas internacionales": { mark: "no",  note: "Traducciones" },
      "RRHH interno":                { mark: "yes" },
    },
  },
  {
    feature: "Notas y plan de acción",
    cells: {
      "GuidePath":                   { mark: "yes", note: "Cliente + profesional" },
      "Mentores sueltos":            { mark: "partial", note: "Email" },
      "Plataformas internacionales": { mark: "yes" },
      "RRHH interno":                { mark: "partial" },
    },
  },
  {
    feature: "Reserva en <60s",
    cells: {
      "GuidePath":                   { mark: "yes" },
      "Mentores sueltos":            { mark: "no",  note: "Por email" },
      "Plataformas internacionales": { mark: "partial" },
      "RRHH interno":                { mark: "no",  note: "Por proceso" },
    },
  },
];

function MarkCell({ mark, note, highlighted }: { mark: Mark; note?: string; highlighted: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      {mark === "yes" && (
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
            highlighted
              ? "bg-teal-600 text-white"
              : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
          }`}
          aria-label="Sí"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {mark === "no" && (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
          aria-label="No"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
      {mark === "partial" && (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          aria-label="Parcial"
        >
          <Minus className="h-3.5 w-3.5" />
        </span>
      )}
      {note && (
        <span className="text-[10px] leading-tight text-stone-500 dark:text-stone-400">
          {note}
        </span>
      )}
    </div>
  );
}

export function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-cmp-row]", sectionRef.current!);
      gsap.set(rows, { y: 16 });
      ScrollTrigger.batch(rows, {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { y: 0, duration: 0.5, ease: "power3.out", stagger: 0.04 }),
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="comparison-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-white py-20 dark:border-stone-800/60 dark:bg-stone-950 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Por qué GuidePath
          </p>
          <h2 id="comparison-title" className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
            ¿Cómo nos comparamos con las alternativas?
          </h2>
          <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
            Lo que obtienes en GuidePath frente a lo más común del mercado.
          </p>
        </FadeIn>

        <div className="mt-12 overflow-x-auto">
          <table className="mx-auto w-full max-w-5xl border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="rounded-tl-2xl bg-stone-50 px-4 py-4 text-left font-display font-semibold text-stone-900 dark:bg-stone-900 dark:text-stone-50">
                  Característica
                </th>
                {COLUMNS.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={`px-4 py-4 text-center font-display font-semibold ${
                      col === "GuidePath"
                        ? "bg-teal-600 text-white"
                        : "bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-50"
                    } ${i === COLUMNS.length - 1 ? "rounded-tr-2xl" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr
                  key={row.feature}
                  data-cmp-row
                  className={ri % 2 === 0 ? "bg-white dark:bg-stone-950" : "bg-stone-50/50 dark:bg-stone-900/30"}
                >
                  <th scope="row" className="border-t border-stone-200 px-4 py-3 text-left text-stone-800 dark:border-stone-800 dark:text-stone-200">
                    {row.feature}
                  </th>
                  {COLUMNS.map((col) => (
                    <td
                      key={col}
                      className={`border-t border-stone-200 px-4 py-3 dark:border-stone-800 ${
                        col === "GuidePath" ? "bg-teal-50/60 dark:bg-teal-900/15" : ""
                      } ${ri === ROWS.length - 1 && col === COLUMNS[0] ? "rounded-bl-none" : ""}`}
                    >
                      <MarkCell
                        mark={row.cells[col].mark}
                        {...(row.cells[col].note ? { note: row.cells[col].note } : {})}
                        highlighted={col === "GuidePath"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400 dark:text-stone-500">
          Comparativa orientativa basada en uso típico de cada categoría. Junio 2026.
        </p>
      </div>
    </section>
  );
}
