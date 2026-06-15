"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Star,
  CheckCircle2,
  Video,
  MessageCircle,
  Mic,
  Calendar,
  Clock,
} from "lucide-react";
import { FadeIn } from "@/components/shared/motion-wrapper";

type Step = 0 | 1 | 2;

const STEPS: { key: Step; label: string; subtitle: string }[] = [
  { key: 0, label: "1. Encuentra a tu profesional", subtitle: "Búsqueda con filtros e idioma." },
  { key: 1, label: "2. Reserva en 1 minuto", subtitle: "Elige hueco — confirmación inmediata." },
  { key: 2, label: "3. Conecta por videollamada", subtitle: "Sala integrada con chat y notas." },
];

const MOCK_PROS = [
  { name: "Dra. Elena Martínez", role: "Psicóloga organizacional", rating: 4.9, color: "bg-teal-600" },
  { name: "Carlos Ruiz",         role: "Coach ejecutivo ICF",      rating: 4.8, color: "bg-amber-600" },
  { name: "Ana García",          role: "Mentora de carrera",       rating: 4.7, color: "bg-rose-600" },
];

const MOCK_SLOTS = ["10:00", "11:30", "14:00", "16:30", "18:00", "19:30"];

export function ProductDemo() {
  const [step, setStep] = useState<Step>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStep((s) => ((s + 1) % 3) as Step);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function goTo(s: Step) {
    setStep(s);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setStep((curr) => ((curr + 1) % 3) as Step);
    }, 6000);
  }

  return (
    <section
      aria-labelledby="product-demo-title"
      className="relative overflow-hidden border-t border-stone-200/70 bg-white py-20 dark:border-stone-800/60 dark:bg-stone-950 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-teal-100/40 blur-3xl dark:bg-teal-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-100/30 blur-3xl dark:bg-amber-500/5"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — narrative */}
          <div>
            <FadeIn>
              <p className="mb-2 text-sm font-display font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
                Cómo se ve
              </p>
              <h2 id="product-demo-title" className="font-display text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">
                De cero a videollamada en menos de 60 segundos
              </h2>
              <p className="mt-4 text-lg text-stone-700 dark:text-stone-300">
                Diseñado para que el proceso sea tan fluido como abrir tu app de mensajería.
              </p>
            </FadeIn>

            <ol className="mt-8 space-y-3">
              {STEPS.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => goTo(s.key)}
                    aria-current={step === s.key}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                      step === s.key
                        ? "border-teal-500 bg-teal-50 shadow-sm dark:border-teal-700 dark:bg-teal-900/20"
                        : "border-stone-200 bg-white hover:border-teal-200 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        step === s.key
                          ? "bg-teal-700 text-white"
                          : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {s.key + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-stone-900 dark:text-stone-50">
                        {s.label.replace(/^\d+\.\s*/, "")}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">{s.subtitle}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Right — mockup */}
          <div className="relative">
            {/* Browser chrome */}
            <div className="rounded-2xl border border-stone-300 bg-white shadow-2xl dark:border-stone-700 dark:bg-stone-900">
              <div className="flex items-center gap-1.5 border-b border-stone-200 px-4 py-2.5 dark:border-stone-800">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-3 rounded-md bg-stone-100 px-3 py-0.5 text-[11px] text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                  guidepath.com
                </span>
              </div>

              {/* Mockup body */}
              <div className="relative min-h-[360px] bg-gradient-to-br from-stone-50 to-white p-5 dark:from-stone-900 dark:to-stone-950 sm:min-h-[420px]">
                {/* Step 0 — search */}
                <div
                  className={`absolute inset-5 transition-all duration-500 ${
                    step === 0 ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={step !== 0}
                >
                  <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-800">
                    <Search className="h-4 w-4 text-stone-400" />
                    <span className="text-sm text-stone-700 dark:text-stone-300">
                      coach ejecutivo
                    </span>
                    <span className="ml-auto inline-block h-4 w-px animate-pulse bg-stone-400" />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {MOCK_PROS.map((p, i) => (
                      <div
                        key={p.name}
                        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-800"
                        style={{ animation: `pulseIn 0.4s ease-out ${i * 0.12}s both` }}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${p.color} text-xs font-bold text-white`}>
                          {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 text-sm font-semibold text-stone-900 dark:text-stone-50">
                            <span className="truncate">{p.name}</span>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                          </p>
                          <p className="text-xs text-teal-600 dark:text-teal-400">{p.role}</p>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-stone-500">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                          </div>
                        </div>
                        <span className="rounded-md bg-teal-700 px-3 py-1 text-[10px] font-medium text-white">
                          Ver perfil
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1 — booking */}
                <div
                  className={`absolute inset-5 transition-all duration-500 ${
                    step === 1 ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={step !== 1}
                >
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                      CR
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Carlos Ruiz</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400">Coach ejecutivo ICF</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Martes 11 jun
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {MOCK_SLOTS.map((slot, i) => (
                        <button
                          key={slot}
                          type="button"
                          className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                            i === 2
                              ? "border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-900/30"
                              : "border-stone-200 bg-white text-stone-700 hover:border-teal-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                          }`}
                          aria-pressed={i === 2}
                          style={{ animation: `pulseIn 0.3s ease-out ${i * 0.05}s both` }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                    <p className="flex items-center gap-2 text-xs font-medium text-teal-800 dark:text-teal-300">
                      <Clock className="h-3.5 w-3.5" />
                      14:00 · 60 min · Gratis (sesión 2/3 del mes)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-sm"
                  >
                    Confirmar reserva
                  </button>
                </div>

                {/* Step 2 — video call */}
                <div
                  className={`absolute inset-5 transition-all duration-500 ${
                    step === 2 ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                  aria-hidden={step !== 2}
                >
                  <div className="relative h-full overflow-hidden rounded-xl bg-stone-900">
                    {/* Main participant */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-800 via-stone-900 to-black">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white shadow-2xl">
                        CR
                      </div>
                    </div>
                    {/* Picture-in-picture self */}
                    <div className="absolute right-3 top-3 h-16 w-24 rounded-lg border border-zinc-700 bg-gradient-to-br from-stone-700 to-stone-900 shadow-lg">
                      <span className="absolute right-1 bottom-1 rounded bg-black/50 px-1 text-[9px] text-white">Tú</span>
                    </div>
                    {/* Status */}
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] text-zinc-100 backdrop-blur">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                      Conectado · 14:23
                    </div>
                    {/* Bottom controls */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 border-t border-zinc-800 bg-zinc-950/80 px-4 py-2.5 backdrop-blur">
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                        <Mic className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                        <Video className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating step indicator dots */}
            <div className="mt-4 flex justify-center gap-2">
              {([0, 1, 2] as Step[]).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir al paso ${i + 1}`}
                  aria-current={step === i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === i ? "w-8 bg-teal-600" : "w-3 bg-stone-300 hover:bg-stone-400 dark:bg-stone-700 dark:hover:bg-stone-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes — scoped to this section */}
      <style jsx>{`
        @keyframes pulseIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </section>
  );
}
