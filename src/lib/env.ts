import { z } from "zod";

const envSchema = z.object({
  // Auth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET es obligatorio"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL debe ser una URL válida"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID es obligatorio"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET es obligatorio"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY es obligatorio"),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, "STRIPE_PUBLISHABLE_KEY es obligatorio"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET es obligatorio"),

  // Daily.co
  DAILY_API_KEY: z.string().min(1, "DAILY_API_KEY es obligatorio"),

  // Resend
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY es obligatorio"),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `\n❌ Variables de entorno inválidas o ausentes:\n${missing}\n\nRevisa tu archivo .env`
    );
  }

  return parsed.data;
}

export const env = validateEnv();
