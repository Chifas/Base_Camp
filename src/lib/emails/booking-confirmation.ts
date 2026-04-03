import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, sessionCard, fmtDate, fmtTime, fmtCurrency, APP_URL } from "./shared";

// ── Template 1 — Booking confirmed (client) ────────────────────────────────────

interface BookingConfirmedProps {
  clientName:       string;
  professionalName: string;
  scheduledAt:      Date | string;
  price:            number;
  sessionId:        string;
}

export function bookingConfirmedHtml(p: BookingConfirmedProps): string {
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">¡Reserva confirmada! 🎉</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.clientName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Tu sesión ha sido confirmada y el pago procesado correctamente.
      Accede a tu panel para ver todos los detalles.
    </p>

    ${sessionCard([
      ["Profesional",  p.professionalName ?? "—"],
      ["Fecha",        fmtDate(p.scheduledAt)],
      ["Hora",         fmtTime(p.scheduledAt)],
      ["Duración",     "60 minutos"],
      ["Tipo",         p.price > 0 ? fmtCurrency(p.price) : "Sesión gratuita"],
    ])}

    ${ctaButton("Ver mi sesión", `${APP_URL}/dashboard/client`)}

    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
      Recuerda que puedes cancelar sin coste hasta 24 h antes de la sesión.
    </p>
  `);
}

// ── Template 2 — New session notification (professional) ──────────────────────

interface NewSessionProps {
  professionalName: string;
  clientName:       string;
  scheduledAt:      Date | string;
  price:            number;
}

export function newSessionHtml(p: NewSessionProps): string {
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Nueva sesión programada 📅</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.professionalName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Tienes una nueva sesión confirmada. Revisa los detalles a continuación.
    </p>

    ${sessionCard([
      ["Cliente",           p.clientName ?? "—"],
      ["Fecha",             fmtDate(p.scheduledAt)],
      ["Hora",              fmtTime(p.scheduledAt)],
      ["Duración",          "60 minutos"],
      ["Puntos de impacto", "+10 pts al completar"],
    ])}

    ${ctaButton("Ir a mi panel", `${APP_URL}/dashboard/professional`)}
  `);
}

// ── Send helpers ───────────────────────────────────────────────────────────────

export interface EmailSessionData {
  id:          string;
  scheduledAt: Date;
  price:       number;
  client:      { name: string | null; email: string };
  professional:{ user: { name: string | null; email: string } };
}

/** Send confirmation to the client + notification to the professional. */
export async function sendBookingEmails(s: EmailSessionData) {
  const clientName       = s.client.name          ?? "Cliente";
  const professionalName = s.professional.user.name ?? "Profesional";

  if (!resend) {
    console.warn("⚠️ Resend no configurado — emails de reserva no enviados");
    return;
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.client.email,
      subject: "Tu sesión ha sido confirmada — GuidePath",
      html:    bookingConfirmedHtml({
        clientName,
        professionalName,
        scheduledAt: s.scheduledAt,
        price:       s.price,
        sessionId:   s.id,
      }),
    }),
    resend.emails.send({
      from:    FROM_EMAIL,
      to:      s.professional.user.email,
      subject: "Nueva sesión programada — GuidePath",
      html:    newSessionHtml({
        professionalName,
        clientName,
        scheduledAt: s.scheduledAt,
        price:       s.price,
      }),
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      logger.error(`Error enviando email de reserva [${i}]`, { reason: String(r.reason) });
    }
  });
}
