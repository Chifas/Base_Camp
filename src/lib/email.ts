import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface BookingConfirmationData {
  to: string;
  clientName: string;
  professionalName: string;
  date: string;
  time: string;
  price: number;
}

export async function sendBookingConfirmation(data: BookingConfirmationData) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY no configurada — email no enviado");
    return;
  }

  const formattedPrice = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(data.price);

  try {
    await resend.emails.send({
      from: "GuidePath <onboarding@resend.dev>",
      to: data.to,
      subject: `Reserva confirmada con ${data.professionalName}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 16px;">
            ¡Reserva confirmada! ✅
          </h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola ${data.clientName},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Tu sesión ha sido reservada con éxito. Aquí tienes los detalles:
          </p>
          <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 4px 0; color: #374151;"><strong>Profesional:</strong> ${data.professionalName}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Fecha:</strong> ${data.date}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Hora:</strong> ${data.time}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Duración:</strong> 60 minutos</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Precio:</strong> ${formattedPrice}</p>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Podrás unirte a la videollamada desde tu panel de control hasta 2 horas antes de la sesión.
          </p>
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/client"
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600;">
            Ir a mi panel
          </a>
          <hr style="border: 1px solid #E5E7EB; margin: 32px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">
            GuidePath — Encuentra tu camino con profesionales que te guían
          </p>
        </div>
      `,
    });

    console.log(`✅ Email de confirmación enviado a ${data.to}`);
  } catch (error) {
    console.error("[Email] Error enviando confirmación:", error);
  }
}
