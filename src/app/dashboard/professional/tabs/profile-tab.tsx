"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Tag,
  FileText,
  Globe,
  Award,
  Plus,
  Trash2,
  Save,
  Loader2,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { LANGUAGES, getLanguageLabel } from "@/lib/languages";
import type { ProfileData, CategoryOption, CertificationItem } from "./types";

interface Props {
  profile: ProfileData | null;
  categories: CategoryOption[];
  certifications: CertificationItem[];
  onUpdate: (updated: Partial<ProfileData>) => void;
  onCertificationsChange: (certs: CertificationItem[]) => void;
}

export default function ProfileTab({
  profile,
  categories,
  certifications,
  onUpdate,
  onCertificationsChange,
}: Props) {
  const [editHeadline, setEditHeadline] = useState(profile?.headline ?? "");
  const [editCategory, setEditCategory] = useState(profile?.category ?? "");
  const [editBio, setEditBio] = useState(profile?.bio ?? "");
  const [editLanguages, setEditLanguages] = useState<string[]>(profile?.languages ?? ["es"]);
  const [editYearsExperience, setEditYearsExperience] = useState(
    profile?.yearsExperience?.toString() ?? ""
  );
  const [newLanguage, setNewLanguage] = useState(""); // used by language Select
  const [saving, setSaving] = useState(false);

  const [showCertForm, setShowCertForm] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certInstitution, setCertInstitution] = useState("");
  const [certYear, setCertYear] = useState("");
  const [savingCert, setSavingCert] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/professionals/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: editHeadline || undefined,
          category: editCategory || undefined,
          bio: editBio || undefined,
          languages: editLanguages,
          yearsExperience: editYearsExperience ? parseInt(editYearsExperience) : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Perfil actualizado correctamente");
        onUpdate({
          headline: editHeadline,
          category: editCategory,
          bio: editBio,
          languages: editLanguages,
          yearsExperience: editYearsExperience ? parseInt(editYearsExperience) : null,
        });
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  }, [editHeadline, editCategory, editBio, editLanguages, editYearsExperience, onUpdate]);

  const handleAddCert = useCallback(async () => {
    setSavingCert(true);
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: certTitle,
          institution: certInstitution,
          year: certYear ? parseInt(certYear) : undefined,
        }),
      });
      if (res.ok) {
        const cert = await res.json();
        onCertificationsChange([...certifications, cert]);
        setCertTitle("");
        setCertInstitution("");
        setCertYear("");
        setShowCertForm(false);
        toast.success("Certificación añadida");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingCert(false);
    }
  }, [certTitle, certInstitution, certYear, certifications, onCertificationsChange]);

  const handleDeleteCert = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/certifications/${id}`, { method: "DELETE" });
        if (res.ok) {
          onCertificationsChange(certifications.filter((c) => c.id !== id));
          toast.success("Certificación eliminada");
        }
      } catch {
        toast.error("Error al eliminar");
      }
    },
    [certifications, onCertificationsChange]
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Tu perfil profesional</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Esta información es visible para los clientes en tu perfil público.
        </p>

        {/* Cover image (banner) — shown above the public profile hero */}
        <div className="mt-6 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Imagen de portada
          </label>
          <PhotoUpload
            aspectRatio="cover"
            currentImage={profile?.coverImage || ""}
            label="Recomendado: 1600×500 px (16:5). Visible al comienzo de tu perfil público."
            onUpload={async (url) => {
              // Persist immediately so the public profile reflects the change
              try {
                const res = await fetch("/api/professionals/me", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ coverImage: url }),
                });
                if (res.ok) {
                  onUpdate({ coverImage: url });
                  toast.success("Imagen de portada guardada");
                } else {
                  const data = await res.json();
                  toast.error(data.error ?? "Error al guardar la portada");
                }
              } catch {
                toast.error("Error de conexión");
              }
            }}
          />
        </div>

        <div className="mt-6">
          <PhotoUpload
            currentImage={profile?.image || ""}
            onUpload={(url) => onUpdate({ image: url })}
          />
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Categoría
            </label>
            <Select value={editCategory} onValueChange={setEditCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-headline" className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Titular profesional
            </label>
            <Input
              id="edit-headline"
              placeholder="Ej: Coach ejecutivo con 10 años de experiencia"
              value={editHeadline}
              onChange={(e) => setEditHeadline(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-bio" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Sobre ti
            </label>
            <textarea
              id="edit-bio"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe tu experiencia y enfoque profesional..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{editBio.length}/1000</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-years" className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4 text-muted-foreground" />
              Años de experiencia
            </label>
            <Input
              id="edit-years"
              type="number"
              min="0"
              max="50"
              placeholder="Ej: 5"
              value={editYearsExperience}
              onChange={(e) => setEditYearsExperience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Idiomas
            </label>
            <div className="flex flex-wrap gap-2">
              {editLanguages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  {getLanguageLabel(lang)}
                  <button
                    type="button"
                    onClick={() => setEditLanguages((prev) => prev.filter((l) => l !== lang))}
                    className="ml-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Select
              value={newLanguage}
              onValueChange={(code) => {
                if (code && !editLanguages.includes(code)) {
                  setEditLanguages((prev) => [...prev, code]);
                }
                setNewLanguage("");
              }}
            >
              <SelectTrigger className="max-w-[220px]">
                <SelectValue placeholder="Añadir idioma…" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter((l) => !editLanguages.includes(l.code)).map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-6" />

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold">Certificaciones</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Títulos y credenciales que avalan tu experiencia.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCertForm(!showCertForm)}>
            <Plus className="mr-1 h-4 w-4" />
            Añadir
          </Button>
        </div>

        {showCertForm && (
          <div className="mt-4 space-y-3 rounded-lg border p-4">
            <Input
              placeholder="Título (ej: Máster en Psicología Clínica)"
              value={certTitle}
              onChange={(e) => setCertTitle(e.target.value)}
            />
            <Input
              placeholder="Institución (ej: Universidad de Barcelona)"
              value={certInstitution}
              onChange={(e) => setCertInstitution(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Año (opcional)"
              value={certYear}
              onChange={(e) => setCertYear(e.target.value)}
              min="1950"
              max="2030"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddCert}
                disabled={savingCert || !certTitle || !certInstitution}
              >
                {savingCert ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCertForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {certifications.length === 0 && !showCertForm ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No has añadido certificaciones todavía.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{cert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {cert.institution}
                    {cert.year ? ` · ${cert.year}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCert(cert.id)}
                  className="text-zinc-400 transition-colors hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
