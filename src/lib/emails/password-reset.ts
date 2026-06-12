import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton } from "./shared";

export function passwordResetHtml(data: { name: string | null; resetUrl: string }): string {
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Restablece tu contraseña</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
      Hola ${data.name ?? ""},<br/>
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
      Haz clic en el botón para crear una contraseña nueva.
    </p>
    ${ctaButton("Restablecer contraseña", data.resetUrl)}
    <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
      Este enlace caduca en 1 hora y solo puede usarse una vez.
      Si no has solicitado este cambio, puedes ignorar este email — tu contraseña seguirá siendo la misma.
    </p>
    <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;word-break:break-all;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <a href="${data.resetUrl}" style="color:#4f46e5;">${data.resetUrl}</a>
    </p>
  `);
}

/** Send password reset email with a single-use link (expires in 1 hour). */
export async function sendPasswordResetEmail(data: {
  email: string;
  name: string | null;
  resetUrl: string;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Restablece tu contraseña - GuidePath",
      html: passwordResetHtml({ name: data.name, resetUrl: data.resetUrl }),
    });
  } catch (error) {
    logger.error("Error enviando email de restablecimiento de contraseña", {
      error: String(error),
    });
  }
}
