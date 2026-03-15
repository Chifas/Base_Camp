import { z } from "zod";

// POST /api/auth/register
export const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["CLIENT", "PROFESSIONAL"]).optional(),
});

// POST /api/payments/create-intent
export const createIntentSchema = z.object({
  professionalId: z.string().min(1, "professionalId es obligatorio"),
  scheduledAt: z.string().min(1, "scheduledAt es obligatorio"),
  duration: z.number().int().positive().optional().default(60),
  notes: z.string().optional(),
});

// POST /api/checkout
export const checkoutSchema = z.object({
  professionalId: z.string().min(1, "professionalId es obligatorio"),
  date: z.string().min(1, "date es obligatorio"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time debe tener formato HH:MM"),
  notes: z.string().optional(),
});

// POST /api/reviews
export const reviewSchema = z.object({
  sessionId: z.string().min(1, "sessionId es obligatorio"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// PUT /api/availability
export const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
      enabled: z.boolean(),
    })
  ),
});

// PATCH /api/sessions/[id]
export const updateSessionSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});
