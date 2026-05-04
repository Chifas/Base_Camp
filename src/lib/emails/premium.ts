import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, APP_URL } from "./shared";

interface PremiumEmailData {
  email: string;
  name: string | null;
}

/** Welcome email after a successful Premium checkout (also covers trial start). */
export async function sendPremiumWelcomeEmail(data: PremiumEmailData & { trialing: boolean }) {
  if (!resend) return;
  const greeting = data.name ?? "Hola";
  const opening = data.trialing
    ? "Tu prueba de 7 días ha comenzado. Disfruta de todos los beneficios sin compromiso — solo te cobraremos si decides continuar."
    : "Tu suscripción Premium ya está activa. Aprovecha todos tus nuevos beneficios.";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: data.trialing ? "Tu prueba Premium ha empezado" : "Bienvenido/a a Premium",
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">¡Bienvenido/a a Premium, ${greeting}!</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          ${opening}
        </p>
        <ul style="margin:16px 0;padding-left:20px;color:#475569;font-size:15px;line-height:1.8;">
          <li>10 sesiones gratuitas al mes</li>
          <li>Cancelación siempre gratis (sin fee 24h)</li>
          <li>Reserva prioritaria en horarios peak</li>
          <li>Badge Premium visible en tu perfil</li>
        </ul>
        ${ctaButton("Ir a mi panel", `${APP_URL}/dashboard/client?tab=subscription`)}
      `),
    });
  } catch (error) {
    logger.error("Error enviando email Premium welcome", { error: String(error) });
  }
}

/** Reminder email sent on day 5 of the trial. */
export async function sendPremiumTrialEndingEmail(data: PremiumEmailData & { endsAt: Date }) {
  if (!resend) return;
  const greeting = data.name ?? "Hola";
  const date = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(data.endsAt);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Tu prueba Premium termina pronto",
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Tu prueba termina el ${date}</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          ${greeting}, en 2 días empezaremos a cobrar tu suscripción Premium. Si quieres continuar no necesitas hacer nada — la renovación es automática.
        </p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          Si prefieres cancelar antes del cargo, puedes hacerlo desde tu panel sin penalización.
        </p>
        ${ctaButton("Gestionar suscripción", `${APP_URL}/dashboard/client?tab=subscription`)}
      `),
    });
  } catch (error) {
    logger.error("Error enviando email trial-ending", { error: String(error) });
  }
}

/** Sent when invoice.payment_failed fires. */
export async function sendPremiumPaymentFailedEmail(data: PremiumEmailData) {
  if (!resend) return;
  const greeting = data.name ?? "Hola";
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "No pudimos cobrar tu suscripción Premium",
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Pago fallido</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          ${greeting}, tu último pago no se ha podido procesar. Para que no pierdas tus beneficios Premium, actualiza tu método de pago en los próximos días.
        </p>
        ${ctaButton("Actualizar tarjeta", `${APP_URL}/dashboard/client?tab=subscription`)}
        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
          Mantenemos tu acceso unos días en gracia. Si no puedes resolverlo, escríbenos a soporte@guidepath.com.
        </p>
      `),
    });
  } catch (error) {
    logger.error("Error enviando email payment-failed", { error: String(error) });
  }
}

/** Sent on customer.subscription.deleted. */
export async function sendPremiumCanceledEmail(data: PremiumEmailData & { endsAt: Date }) {
  if (!resend) return;
  const greeting = data.name ?? "Hola";
  const date = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(data.endsAt);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Has cancelado tu suscripción Premium",
      html: layout(`
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;">Suscripción cancelada</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          ${greeting}, hemos procesado la cancelación de tu suscripción Premium. Mantienes todos tus beneficios hasta el ${date}.
        </p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
          Después volverás automáticamente al plan Free con 3 sesiones gratuitas al mes. Puedes reactivar Premium cuando quieras.
        </p>
        ${ctaButton("Volver a GuidePath", `${APP_URL}/dashboard/client`)}
      `),
    });
  } catch (error) {
    logger.error("Error enviando email premium-canceled", { error: String(error) });
  }
}
