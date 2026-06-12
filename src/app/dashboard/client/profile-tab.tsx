"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/shared/photo-upload";

interface AccountData {
  name: string | null;
  email: string;
  bio: string | null;
  image: string | null;
  hasPassword: boolean;
}

export function ProfileTab() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  // Personal data form
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data: AccountData) => {
        if (data.email) {
          setAccount(data);
          setName(data.name ?? "");
          setBio(data.bio ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "No se pudieron guardar los cambios");
        return;
      }
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("La contraseña nueva debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "No se pudo cambiar la contraseña");
        return;
      }
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    try {
      const res = await fetch("/api/users/me/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim(), password: emailPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "No se pudo cambiar el email");
        return;
      }
      toast.success("Email actualizado. Vuelve a iniciar sesión.");
      // The JWT still carries the old email — force a fresh login
      setTimeout(() => signOut({ callbackUrl: "/auth/login" }), 1500);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          account?.hasPassword ? { password: deletePassword } : {}
        ),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "No se pudo eliminar la cuenta");
        return;
      }
      toast.success("Cuenta eliminada");
      setTimeout(() => signOut({ callbackUrl: "/" }), 1000);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Foto de perfil</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu foto se muestra a los profesionales con los que reservas.
        </p>
        <div className="mt-6">
          <PhotoUpload currentImage={account?.image ?? ""} />
        </div>
      </div>

      {/* Personal data */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Datos personales</h3>
        <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="profile-bio" className="text-sm font-medium">
              Sobre ti <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Cuéntale brevemente a los profesionales en qué punto de tu carrera estás…"
            />
          </div>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </form>
      </div>

      {/* Email */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-heading text-lg font-semibold">Email</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Email actual: <strong>{account?.email}</strong>
        </p>
        {account?.hasPassword ? (
          <form className="mt-6 space-y-4" onSubmit={handleChangeEmail}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="new-email" className="text-sm font-medium">
                  Email nuevo
                </label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nuevo@email.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email-password" className="text-sm font-medium">
                  Contraseña actual
                </label>
                <Input
                  id="email-password"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tras cambiar el email tendrás que volver a iniciar sesión.
            </p>
            <Button type="submit" disabled={savingEmail || !newEmail || !emailPassword}>
              {savingEmail ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
              ) : (
                "Cambiar email"
              )}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Tu cuenta usa inicio de sesión con Google, por lo que el email no puede
            cambiarse desde aquí.
          </p>
        )}
      </div>

      {/* Password */}
      {account?.hasPassword && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-heading text-lg font-semibold">Contraseña</h3>
          <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="current-password" className="text-sm font-medium">
                  Contraseña actual
                </label>
                <Input
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-sm font-medium">
                  Contraseña nueva
                </label>
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar nueva
                </label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {savingPassword ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
                ) : (
                  "Cambiar contraseña"
                )}
              </Button>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <h3 className="font-heading text-lg font-semibold text-destructive">
          Eliminar cuenta
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Se eliminarán tus datos personales de forma permanente y se cancelarán tus
          sesiones programadas. Esta acción no se puede deshacer.
        </p>
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Eliminar mi cuenta
          </Button>
        ) : (
          <div className="mt-4 space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Escribe <strong>ELIMINAR</strong>
                {account?.hasPassword && " e introduce tu contraseña"} para confirmar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                aria-label="Confirmación de eliminación"
              />
              {account?.hasPassword && (
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Tu contraseña"
                  aria-label="Contraseña"
                />
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                disabled={
                  deleting ||
                  deleteConfirmText !== "ELIMINAR" ||
                  (account?.hasPassword ? !deletePassword : false)
                }
                onClick={handleDeleteAccount}
              >
                {deleting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Eliminando...</>
                ) : (
                  "Eliminar definitivamente"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                  setDeletePassword("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
