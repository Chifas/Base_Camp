"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

type AspectRatio = "square" | "cover";

interface PhotoUploadProps {
  currentImage?: string;
  onUpload?: (_url: string) => void;
  /** "square" → circular avatar (default). "cover" → 16:5 banner. */
  aspectRatio?: AspectRatio;
  /** Custom helper label below the upload control. */
  label?: string;
}

export function PhotoUpload({
  currentImage,
  onUpload,
  aspectRatio = "square",
  label,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB");
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setPreview(data.url);
      onUpload?.(data.url);
      toast.success("Imagen actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la imagen");
      setPreview(currentImage || "");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  const isCover = aspectRatio === "cover";
  const containerSize = isCover
    ? "h-28 w-full sm:h-36"
    : "h-24 w-24";
  const containerShape = isCover ? "rounded-2xl" : "rounded-full";
  const helperText = label ?? (isCover ? "Haz clic para subir tu imagen de portada" : "Haz clic para cambiar tu foto");
  const PlaceholderIcon = isCover ? ImagePlus : Camera;

  return (
    <div className={`flex flex-col gap-3 ${isCover ? "items-stretch" : "items-center"}`}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative ${containerSize} overflow-hidden ${containerShape} border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-500 transition-colors group`}
      >
        {preview ? (
          <Image
            src={preview}
            alt={isCover ? "Imagen de portada" : "Foto de perfil"}
            fill
            sizes={isCover ? "(min-width: 1024px) 800px, 100vw" : "96px"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <PlaceholderIcon className={isCover ? "h-10 w-10 text-zinc-400" : "h-8 w-8 text-zinc-400"} />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <span className={`text-xs text-zinc-500 ${isCover ? "" : "text-center"}`}>{helperText}</span>
    </div>
  );
}
