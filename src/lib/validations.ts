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
  ratingPunctuality: z.number().int().min(1).max(5).optional(),
  ratingKnowledge: z.number().int().min(1).max(5).optional(),
  ratingCommunication: z.number().int().min(1).max(5).optional(),
  ratingValue: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

// PUT /api/availability
export const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^(\d{2}:\d{2})?$/, "Formato HH:MM"),
      endTime: z.string().regex(/^(\d{2}:\d{2})?$/, "Formato HH:MM"),
      enabled: z.boolean(),
    })
  ),
});

// Valid ProfessionalCategory enum values (must match prisma schema)
const professionalCategoryEnum = z.enum([
  "PSYCHOLOGIST",
  "COACH",
  "CAREER_MENTOR",
  "NUTRITIONIST",
]);

// POST /api/professionals/me (onboarding — create profile)
export const createProfessionalProfileSchema = z.object({
  category: professionalCategoryEnum,
  headline: z.string().min(5, "El titular debe tener al menos 5 caracteres").max(120),
  hourlyRate: z.number().min(1, "La tarifa debe ser al menos 1€"),
  bio: z.string().max(1000).optional(),
});

// PUT /api/professionals/me (edit profile)
export const updateProfessionalProfileSchema = z.object({
  category: professionalCategoryEnum.optional(),
  headline: z.string().min(5).max(120).optional(),
  hourlyRate: z.number().min(1).optional(),
  bio: z.string().max(1000).optional(),
  languages: z.array(z.string().min(1)).optional(),
  yearsExperience: z.number().int().min(0).optional(),
});

// PATCH /api/sessions/[id]
export const updateSessionSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  notes: z.string().max(5000, "Las notas no pueden superar los 5000 caracteres").optional(),
}).refine((data) => data.status || data.notes, {
  message: "Debes proporcionar status o notes",
});

// PATCH /api/notifications
export const markNotificationsSchema = z.union([
  z.object({ ids: z.array(z.string().min(1)).min(1) }),
  z.object({ all: z.literal(true) }),
]);

// POST /api/sessions/[id]/reschedule
export const rescheduleRequestSchema = z.object({
  proposedAt: z.string().min(1, "proposedAt es obligatorio").refine(
    (val) => !isNaN(new Date(val).getTime()),
    "proposedAt debe ser una fecha válida"
  ),
});

// PATCH /api/sessions/[id]/reschedule
export const rescheduleResponseSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

// POST /api/reviews/[id]/respond
export const professionalResponseSchema = z.object({
  response: z.string().min(1, "La respuesta es obligatoria").max(500, "Máximo 500 caracteres"),
});

// POST /api/reviews/[id]/report
export const reportReviewSchema = z.object({
  reason: z.string().min(1, "El motivo es obligatorio").max(500, "Máximo 500 caracteres"),
});

// POST /api/certifications
export const certificationSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  institution: z.string().min(1, "La institución es obligatoria").max(200),
  year: z.number().int().min(1950).max(2030).optional(),
});

// POST /api/feedback
export const betaFeedbackSchema = z.object({
  sessionId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().min(5, "El feedback debe tener al menos 5 caracteres").max(2000),
});

// POST /api/referrals
export const createReferralSchema = z.object({
  type: z.enum(["PROFESSIONAL_TO_PROFESSIONAL", "CLIENT_TO_CLIENT"]),
});

// POST /api/referrals/redeem
export const redeemReferralSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
});

// POST /api/waitlist
export const waitlistSchema = z.object({
  email: z.string().email("Email no válido"),
  name: z.string().optional(),
  source: z.string().optional(),
});

// POST /api/messages
export const sendMessageSchema = z.object({
  sessionId: z.string().min(1, "sessionId es obligatorio"),
  content: z.string().min(1, "El mensaje no puede estar vacío").max(2000, "Máximo 2000 caracteres"),
  type: z.enum(["text", "file"]).default("text"),
  fileUrl: z.string().url("URL inválida").optional(),
  fileName: z.string().max(255).optional(),
});

// POST /api/blocked-dates
export const blockedDateSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  reason: z.string().max(200).optional(),
});
