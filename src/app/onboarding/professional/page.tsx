"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2, Briefcase, FileText, Tag } from "lucide-react";
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

export default function ProfessionalOnboardingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [category, setCategory] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Check if already has profile + load categories
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

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
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/professionals/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          headline,
          hourlyRate: 0,
          bio: bio || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear el perfil.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/professional");
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setSubmitting(false);
    }
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
            <Image src="/logo.svg" alt="GuidePath" width={140} height={126} className="mx-auto drop-shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
          </div>
          <h1 className="font-heading text-3xl font-bold">
            Configura tu perfil profesional
          </h1>
          <p className="mt-2 text-muted-foreground">
            Completa tu perfil para que los clientes puedan encontrarte y reservar sesiones contigo.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Category */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Categoría profesional *
            </label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setFieldErrors((prev) => ({ ...prev, category: "" })); }}>
              <SelectTrigger className={fieldErrors.category ? "border-destructive" : ""}>
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
            {fieldErrors.category && <p className="text-xs text-destructive">{fieldErrors.category}</p>}
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label htmlFor="headline" className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Titular profesional *
            </label>
            <Input
              id="headline"
              placeholder="Ej: Coach ejecutivo con 10 años de experiencia"
              className={fieldErrors.headline ? "border-destructive" : ""}
              value={headline}
              onChange={(e) => { setHeadline(e.target.value); setFieldErrors((prev) => ({ ...prev, headline: "" })); }}
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              Una frase corta que describa tu perfil ({headline.length}/120)
            </p>
            {fieldErrors.headline && <p className="text-xs text-destructive">{fieldErrors.headline}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Sobre ti (opcional)
            </label>
            <textarea
              id="bio"
              className={`flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.bio ? "border-destructive" : ""}`}
              placeholder="Cuéntale a tus clientes potenciales sobre tu experiencia, formación y enfoque..."
              value={bio}
              onChange={(e) => { setBio(e.target.value); setFieldErrors((prev) => ({ ...prev, bio: "" })); }}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/1000</p>
            {fieldErrors.bio && <p className="text-xs text-destructive">{fieldErrors.bio}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando perfil...
              </>
            ) : (
              "Crear perfil profesional"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
