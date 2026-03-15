import { Resend } from "resend";

// Server-side Resend client singleton
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️ RESEND_API_KEY no configurada — emails deshabilitados");
}
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Canonical "from" address. Override with RESEND_FROM_EMAIL in .env.
 *  During development with the free Resend tier you can use the sandbox
 *  sender "onboarding@resend.dev" until your domain is verified. */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "GuidePath <onboarding@resend.dev>";
