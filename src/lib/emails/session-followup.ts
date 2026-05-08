import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, APP_URL } from "./shared";

interface FollowupProps {
  clientEmail:      string;
  clientName:       string;
  professionalName: string;
  professionalId:   string;
  sessionId:        string;
  summary:          string | null;
  nextSteps:        string | null;
  actionItems:      string[];
}

export function sessionFollowupHtml(p: FollowupProps): string {
  const dashUrl    = `${APP_URL}/dashboard/client?tab=past`;
  const rebookUrl  = `${APP_URL}/professional/${p.professionalId}`;

  const summaryBlock = p.summary
    ? `
      <h3 style="margin:24px 0 6px;font-size:14px;font-weight:600;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px;">Resumen</h3>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(p.summary)}</p>
    `
    : "";

  const stepsBlock = p.nextSteps
    ? `
      <h3 style="margin:24px 0 6px;font-size:14px;font-weight:600;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px;">Próximos pasos</h3>
      <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(p.nextSteps)}</p>
    `
    : "";

  const itemsBlock =
    p.actionItems.length > 0
      ? `
        <h3 style="margin:24px 0 6px;font-size:14px;font-weight:600;color:#0d9488;text-transform:uppercase;letter-spacing:0.5px;">Tus tareas</h3>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
          ${p.actionItems.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}
        </ul>
      `
      : "";

  const noNotesBlock =
    !p.summary && !p.nextSteps && p.actionItems.length === 0
      ? `<p style="margin:16px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
          Esperamos que te haya resultado útil. ¿Listo para el siguiente paso?
        </p>`
      : "";

  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">¿Cómo te fue con ${escapeHtml(p.professionalName)}?</h2>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Hola ${escapeHtml(p.clientName)}, han pasado un par de días desde tu sesión.
      ${p.summary || p.nextSteps || p.actionItems.length > 0 ? "Aquí tienes lo que tu profesional ha compartido:" : ""}
    </p>

    ${summaryBlock}
    ${stepsBlock}
    ${itemsBlock}
    ${noNotesBlock}

    ${ctaButton("Ver notas y marcar tareas", dashUrl)}

    <p style="margin:32px 0 0;font-size:14px;color:#64748b;line-height:1.6;text-align:center;">
      ¿Quieres mantener el progreso? Reserva una nueva sesión —
      <a href="${rebookUrl}" style="color:#0d9488;text-decoration:underline;">consulta su disponibilidad</a>.
    </p>
  `);
}

export async function sendSessionFollowupEmail(p: FollowupProps) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      p.clientEmail,
      subject: `¿Cómo te fue con ${p.professionalName}? — GuidePath`,
      html:    sessionFollowupHtml(p),
    });
  } catch (error) {
    logger.error("Error enviando email de seguimiento", { sessionId: p.sessionId, error: String(error) });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
