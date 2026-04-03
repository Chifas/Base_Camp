import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, sessionCard, fmtDate, fmtTime, APP_URL } from "./shared";
import type { EmailSessionData } from "./booking-confirmation";

// ── Template 4 — Session reminder (both parties) ─────────────────────────────

interface SessionReminderProps {
  recipientName:  string;
  otherPartyName: string;
  role:           "client" | "professional";
  scheduledAt:    Date | string;
  sessionId:      string;
}

export function sessionReminderHtml(p: SessionReminderProps): string {
  const dashUrl = `${APP_URL}/dashboard/${p.role}`;
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Tu sesión es en 1 hora ⏰</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.recipientName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Tu sesión con <strong>${p.otherPartyName ?? "—"}</strong> comienza pronto.
      Asegúrate de estar preparado/a.
    </p>

    ${sessionCard([
      [p.role === "client" ? "Profesional" : "Cliente", p.otherPartyName ?? "—"],
      ["Fecha", fmtDate(p.scheduledAt)],
      ["Hora",  fmtTime(p.scheduledAt)],
    ])}

    ${ctaButton("Ir a mi panel", dashUrl)}

    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
      Comprueba que tu cámara y micrófono funcionan correctamente antes de la sesión.
    </p>
  `);
}

/** Send reminder emails to both parties before a session. */
export async function sendSessionReminderEmails(s: EmailSessionData) {
  if (!resend) return;
  const clientName       = s.client.name          ?? "Cliente";
  const professionalName = s.professional.user.name ?? "Profesional";

  const results = await Promise.allSettled([
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.client.email,
      subject: "Tu sesión es en 1 hora — GuidePath",
      html:    sessionReminderHtml({
        recipientName:  clientName,
        otherPartyName: professionalName,
        role:           "client",
        scheduledAt:    s.scheduledAt,
        sessionId:      s.id,
      }),
    }),
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.professional.user.email,
      subject: "Tu sesión es en 1 hora — GuidePath",
      html:    sessionReminderHtml({
        recipientName:  professionalName,
        otherPartyName: clientName,
        role:           "professional",
        scheduledAt:    s.scheduledAt,
        sessionId:      s.id,
      }),
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      logger.error(`Error enviando email de recordatorio [${i}]`, { reason: String(r.reason) });
    }
  });
}
