"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Loader2,
  Briefcase,
  FileText,
  Tag,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProfessionalProfileSchema } from "@/lib/validations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryOption {
  id: string;
  name: string;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const DAY_MAP = [1, 2, 3, 4, 5, 6, 0]; // Mon=1 ... Sun=0

const STEPS = [
  { title: "Especialidad", icon: Tag },
  { title: "Sobre ti", icon: FileText },
  { title: "Disponibilidad", icon: Clock },
];

export default function ProfessionalOnboardingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  // Step 1 fields
  const [category, setCategory] = useState("");
  const [headline, setHeadline] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 2 fields
  const [bio, setBio] = useState("");

  // Step 3 fields
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAY_MAP.map((day) => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      enabled: day >= 1 && day <= 5, // Mon-Fri enabled by default
    }))
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/professionals/me").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([profileData, catsData]) => {
        if (profileData.hasProfile) {
          router.replace("/dashboard/professional");
          return;
        }
        setCategories(Array.isArray(catsData) ? catsData : []);
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function validateStep(): boolean {
    setFieldErrors({});

    if (step === 0) {
      const errors: Record<string, string> = {};
      if (!category) errors.category = "Selecciona una categoría";
      if (!headline || headline.length < 5)
        errors.headline = "El titular debe tener al menos 5 caracteres";
      if (headline.length > 120)
        errors.headline = "Máximo 120 caracteres";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
    }

    if (step === 2) {
      const enabledSlots = availability.filter((s) => s.enabled);
      if (enabledSlots.length === 0) {
        setError("Debes habilitar al menos un día de disponibilidad");
        return false;
      }
    }

    return true;
  }

  function handleNext() {
    setError("");
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setError("");
    if (!validateStep()) return;

    // Validate with Zod
    const parsed = createProfessionalProfileSchema.safeParse({
      category: category || undefined,
      headline,
      hourlyRate: 0,
      bio: bio || undefined,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0]?.toString();
        if (field && !errors[field]) errors[field] = err.message;
      });
      setFieldErrors(errors);
      setStep(0);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create professional profile
      const profileRes = await fetch("/api/professionals/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          headline,
          hourlyRate: 0,
          bio: bio || undefined,
        }),
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        setError(profileData.error ?? "Error al crear el perfil.");
        setSubmitting(false);
        return;
      }

      // 2. Save availability
      const enabledSlots = availability.filter(
        (s) => s.enabled && s.startTime && s.endTime
      );
      if (enabledSlots.length > 0) {
        await fetch("/api/availability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slots: availability }),
        });
      }

      router.push("/dashboard/professional");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  function updateSlot(index: number, field: keyof AvailabilitySlot, value: string | boolean) {
    setAvailability((prev) => {
      const copy = [...prev];
      const current = copy[index];
      if (current) copy[index] = { ...current, [field]: value };
      return copy;
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/logo.svg"
              alt="GuidePath"
              width={140}
              height={126}
              className="mx-auto drop-shadow-[0_0_20px_rgba(37,99,235,0.25)]"
            />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            Configura tu perfil profesional
          </h1>
          <p className="mt-2 text-muted-foreground">
            Completa estos pasos para que los clientes puedan encontrarte.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 transition-colors ${
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Paso {step + 1} de {STEPS.length}: {STEPS[step]?.title}
        </p>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Steps */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Category + Headline */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Categoría profesional *
                  </label>
                  <Select
                    value={category}
                    onValueChange={(v) => {
                      setCategory(v);
                      setFieldErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  >
                    <SelectTrigger
                      className={
                        fieldErrors.category ? "border-destructive" : ""
                      }
                    >
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.category && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="headline"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Titular profesional *
                  </label>
                  <Input
                    id="headline"
                    placeholder="Ej: Coach ejecutivo con 10 años de experiencia"
                    className={
                      fieldErrors.headline ? "border-destructive" : ""
                    }
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, headline: "" }));
                    }}
                    maxLength={120}
                  />
                  <p className="text-xs text-muted-foreground">
                    Una frase corta que describa tu perfil ({headline.length}
                    /120)
                  </p>
                  {fieldErrors.headline && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.headline}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Bio */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Sobre ti
                  </label>
                  <textarea
                    id="bio"
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Cuéntale a tus clientes potenciales sobre tu experiencia, formación y enfoque..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/1000 — Una buena bio aumenta tus
                    reservas significativamente
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Availability */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Configura tu horario semanal. Necesitas al menos un día
                  habilitado para aparecer en la búsqueda.
                </p>
                <div className="space-y-3">
                  {availability.map((slot, i) => (
                    <div
                      key={i}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border p-3 transition-colors ${
                        slot.enabled
                          ? "border-primary/30 bg-primary/5"
                          : "border-muted opacity-60"
                      }`}
                    >
                      <label className="flex min-w-[7rem] cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(e) =>
                            updateSlot(i, "enabled", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <span className="text-sm font-medium">
                          {DAYS[i]}
                        </span>
                      </label>
                      {slot.enabled && (
                        <div className="flex flex-1 items-center gap-2 min-w-0">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(i, "startTime", e.target.value)
                            }
                            className="h-8 min-w-0 flex-1 text-xs"
                          />
                          <span className="shrink-0 text-muted-foreground">—</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(i, "endTime", e.target.value)
                            }
                            className="h-8 min-w-0 flex-1 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              disabled={submitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Atrás
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
              size="lg"
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando perfil...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Crear perfil profesional
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
