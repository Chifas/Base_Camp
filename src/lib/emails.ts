/**
 * Email templates and send helpers for GuidePath.
 *
 * Templates are plain HTML strings with inline styles so they render
 * consistently across all major email clients. Each exported `send*`
 * function is fire-and-forget: it logs errors but never throws, so a
 * failed email never breaks an API response.
 */

import { resend, FROM_EMAIL } from "@/lib/resend";
import { log } from "@/lib/logger";

// ── Constants ─────────────────────────────────────────────────────────────────

const APP_URL   = process.env.NEXTAUTH_URL ?? "https://guidepath.app";
const BRAND_CLR = "#4f46e5"; // indigo-600

// ── Formatting helpers (server-safe, no browser APIs needed) ──────────────────

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  }).format(new Date(d));
}

function fmtTime(d: Date | string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour:   "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style:    "currency",
    currency: "EUR",
  }).format(n);
}

// ── Base layout ───────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GuidePath</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Inter,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_CLR};padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">GuidePath</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">
                © ${new Date().getFullYear()} GuidePath · Todos los derechos reservados
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Has recibido este email porque tienes una cuenta en GuidePath.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Reusable HTML fragments ───────────────────────────────────────────────────

function ctaButton(label: string, url: string): string {
  return `<div style="text-align:center;margin:32px 0 0;">
    <a href="${url}"
       style="display:inline-block;background-color:${BRAND_CLR};color:#ffffff;
              text-decoration:none;padding:14px 32px;border-radius:8px;
              font-weight:600;font-size:15px;">
      ${label}
    </a>
  </div>`;
}

function sessionCard(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:10px 16px;color:#64748b;font-size:13px;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;">${value}</td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:24px 0 0;">
    ${cells}
  </table>`;
}

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
      ["Importe",      fmtCurrency(p.price)],
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
  const net = p.price * 0.85;
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Nueva sesión programada 📅</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.professionalName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      Tienes una nueva sesión confirmada. Revisa los detalles a continuación.
    </p>

    ${sessionCard([
      ["Cliente",      p.clientName ?? "—"],
      ["Fecha",        fmtDate(p.scheduledAt)],
      ["Hora",         fmtTime(p.scheduledAt)],
      ["Duración",     "60 minutos"],
      ["Tus ingresos", fmtCurrency(net) + " (neto, 15 % comisión)"],
    ])}

    ${ctaButton("Ir a mi panel", `${APP_URL}/dashboard/professional`)}
  `);
}

// ── Template 3 — Session cancelled ────────────────────────────────────────────

interface CancelledProps {
  recipientName: string;
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

// ── Send helpers (fire-and-forget) ────────────────────────────────────────────

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
    // Client: booking confirmed
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

    // Professional: new session
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
      log.error(`Error enviando email de reserva [${i}]`, { reason: String(r.reason) });
    }
  });
}

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

// ── Template 5 — New review notification (professional) ──────────────────────

interface NewReviewProps {
  professionalName: string;
  clientName:       string;
  rating:           number;
  comment?:         string | null;
}

export function newReviewHtml(p: NewReviewProps): string {
  const stars = "★".repeat(p.rating) + "☆".repeat(5 - p.rating);
  return layout(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Nueva reseña recibida ⭐</h2>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;">
      Hola ${p.professionalName ?? ""},
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
      <strong>${p.clientName ?? "Un cliente"}</strong> ha dejado una valoración sobre tu sesión.
    </p>

    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:28px;letter-spacing:2px;color:#f59e0b;">${stars}</p>
      ${p.comment ? `<p style="margin:0;color:#475569;font-size:14px;font-style:italic;">"${p.comment}"</p>` : ""}
    </div>

    ${ctaButton("Ver mis reseñas", `${APP_URL}/dashboard/professional`)}
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
      log.error(`Error enviando email de recordatorio [${i}]`, { reason: String(r.reason) });
    }
  });
}

/** Send review notification to the professional. */
export async function sendNewReviewEmail(data: {
  professionalEmail: string;
  professionalName:  string;
  clientName:        string;
  rating:            number;
  comment?:          string | null;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from:    FROM_EMAIL,
      to:      data.professionalEmail,
      subject: "Has recibido una nueva reseña — GuidePath",
      html:    newReviewHtml({
        professionalName: data.professionalName,
        clientName:       data.clientName,
        rating:           data.rating,
        comment:          data.comment,
      }),
    });
  } catch (error) {
    log.error("Error enviando email de nueva reseña", { error: String(error) });
  }
}

/** Send onboarding email to a professional. */
export async function sendOnboardingEmail(data: {
  email: string;
  name: string;
  step: 1 | 3 | 7;
  profileId: string;
}) {
  if (!resend) return;

  const subjects: Record<number, string> = {
    1: "Bienvenido a GuidePath - Completa tu perfil",
    3: "Configura tu disponibilidad en GuidePath",
    7: "Comparte tu perfil y consigue tu primer cliente",
  };

  const bodies: Record<number, string> = {
    1: `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Bienvenido/a a GuidePath</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
        Hola ${data.name}, completa tu perfil profesional para empezar a recibir reservas.
      </p>
      ${ctaButton("Completar mi perfil", `${APP_URL}/dashboard/professional`)}
    `,
    3: `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Configura tu disponibilidad</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
        Hola ${data.name}, configura tu horario para que los clientes puedan reservar sesiones contigo.
      </p>
      ${ctaButton("Configurar disponibilidad", `${APP_URL}/dashboard/professional`)}
    `,
    7: `
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Consigue tu primer cliente</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
        Hola ${data.name}, comparte tu perfil de GuidePath y consigue tu primera reserva.
      </p>
      ${ctaButton("Ver mi perfil", `${APP_URL}/dashboard/professional`)}
    `,
  };

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: subjects[data.step] ?? "Novedades de GuidePath",
      html: layout(bodies[data.step] ?? ""),
    });
  } catch (error) {
    log.error("Error enviando email de onboarding", { error: String(error) });
  }
}

/** Send waitlist confirmation email. */
export async function sendWaitlistConfirmationEmail(data: {
  email: string;
  name: string | null;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Te has unido a la lista de espera - GuidePath",
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Estás en la lista</h2>
        <p style="margin:0;color:#475569;font-size:15px;line-height:1.6;">
          Hola ${data.name ?? ""},<br/>
          Te avisaremos cuando haya nuevas plazas disponibles en GuidePath.
        </p>
      `),
    });
  } catch (error) {
    log.error("Error enviando email de waitlist", { error: String(error) });
  }
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
      log.error(`Error enviando email de cancelación [${i}]`, { reason: String(r.reason) });
    }
  });
}
