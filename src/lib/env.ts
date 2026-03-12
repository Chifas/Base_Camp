import { z } from "zod";

// Variables críticas: sin ellas la app no puede arrancar
const requiredSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET es obligatorio"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL debe ser una URL válida"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
});

// Variables opcionales: se validan cuando se usan (Stripe, Daily, Resend, Google)
const optionalSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  DAILY_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

const envSchema = requiredSchema.merge(optionalSchema);

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
