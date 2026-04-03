import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, fmtDate, fmtTime, APP_URL } from "./shared";
import type { EmailSessionData } from "./booking-confirmation";

// ── Template 3 — Session cancelled ────────────────────────────────────────────

interface CancelledProps {
  recipientName:  string;
  otherPartyName: string;
  role:           "client" | "professional";
  scheduledAt:    Date | string;
}

export function sessionCancelledHtml(p: CancelledProps): string {
  const dashUrl = `${APP_URL}/dashboard/${p.role}`;
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Sesión cancelada</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.recipientName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Tu sesión del <strong>${fmtDate(p.scheduledAt)}</strong> a las
      <strong>${fmtTime(p.scheduledAt)}</strong> con
      <strong>${p.otherPartyName ?? "—"}</strong> ha sido cancelada.
    </p>
    ${p.role === "client" ? `
    <p style="margin:16px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
      Si el pago ya había sido procesado, el reembolso tardará 5–10 días hábiles
      en aparecer en tu método de pago.
    </p>` : ""}

    ${ctaButton("Volver a mi panel", dashUrl)}
  `);
}

/** Send cancellation notice to both parties. */
export async function sendCancellationEmails(s: EmailSessionData) {
  const clientName       = s.client.name          ?? "Cliente";
  const professionalName = s.professional.user.name ?? "Profesional";

  if (!resend) {
    console.warn("⚠️ Resend no configurado — emails de cancelación no enviados");
    return;
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.client.email,
      subject: "Tu sesión ha sido cancelada — GuidePath",
      html:    sessionCancelledHtml({
        recipientName:  clientName,
        otherPartyName: professionalName,
        role:           "client",
        scheduledAt:    s.scheduledAt,
      }),
    }),
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.professional.user.email,
      subject: "Sesión cancelada — GuidePath",
      html:    sessionCancelledHtml({
        recipientName:  professionalName,
        otherPartyName: clientName,
        role:           "professional",
        scheduledAt:    s.scheduledAt,
      }),
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      logger.error(`Error enviando email de cancelación [${i}]`, { reason: String(r.reason) });
    }
  });
}
