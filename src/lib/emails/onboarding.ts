import { resend, FROM_EMAIL } from "@/lib/resend";
import { logger } from "@/lib/logger";
import { layout, ctaButton, APP_URL } from "./shared";

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
    logger.error("Error enviando email de onboarding", { error: String(error) });
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
    logger.error("Error enviando email de waitlist", { error: String(error) });
  }
}
