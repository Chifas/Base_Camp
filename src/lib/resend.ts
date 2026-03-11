import { Resend } from "resend";

// Server-side Resend client singleton
export const resend = new Resend(process.env.RESEND_API_KEY);

/** Canonical "from" address. Override with RESEND_FROM_EMAIL in .env.
 *  During development with the free Resend tier you can use the sandbox
 *  sender "onboarding@resend.dev" until your domain is verified. */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "GuidePath <onboarding@resend.dev>";
