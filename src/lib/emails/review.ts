import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, APP_URL } from "./shared";

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
    logger.error("Error enviando email de nueva reseña", { error: String(error) });
  }
}
