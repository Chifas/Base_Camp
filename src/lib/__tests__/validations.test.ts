import { describe, it, expect } from "vitest";
import {
  registerSchema,
  reviewSchema,
  availabilitySchema,
  createProfessionalProfileSchema,
  updateSessionSchema,
  createIntentSchema,
} from "../validations";

describe("registerSchema", () => {
  it("validates correct input", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "juan@test.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "juan@test.com",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "not-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "juan@test.com",
      password: "1234",
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("validates correct review", () => {
    const result = reviewSchema.safeParse({
      sessionId: "sess-1",
      rating: 5,
      comment: "Great!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({
      sessionId: "sess-1",
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({
      sessionId: "sess-1",
      rating: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("availabilitySchema", () => {
  it("accepts enabled slot with valid times", () => {
    const result = availabilitySchema.safeParse({
      slots: [{ dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: true }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts disabled slot with empty times", () => {
    const result = availabilitySchema.safeParse({
      slots: [{ dayOfWeek: 0, startTime: "", endTime: "", enabled: false }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid time format", () => {
    const result = availabilitySchema.safeParse({
      slots: [{ dayOfWeek: 1, startTime: "9am", endTime: "2pm", enabled: true }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects dayOfWeek out of range", () => {
    const result = availabilitySchema.safeParse({
      slots: [{ dayOfWeek: 8, startTime: "09:00", endTime: "14:00", enabled: true }],
    });
    expect(result.success).toBe(false);
  });
});

describe("createProfessionalProfileSchema", () => {
  it("validates correct profile", () => {
    const result = createProfessionalProfileSchema.safeParse({
      category: "COACH",
      headline: "Expert coach with 10 years",
      hourlyRate: 65,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty category", () => {
    const result = createProfessionalProfileSchema.safeParse({
      category: "",
      headline: "Expert",
      hourlyRate: 65,
    });
    expect(result.success).toBe(false);
  });

  it("rejects headline too short", () => {
    const result = createProfessionalProfileSchema.safeParse({
      category: "COACH",
      headline: "Hi",
      hourlyRate: 65,
    });
    expect(result.success).toBe(false);
  });

  it("accepts hourlyRate of 0 (freemium)", () => {
    const result = createProfessionalProfileSchema.safeParse({
      category: "COACH",
      headline: "Expert coach",
      hourlyRate: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative hourlyRate", () => {
    const result = createProfessionalProfileSchema.safeParse({
      category: "COACH",
      headline: "Expert coach",
      hourlyRate: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateSessionSchema", () => {
  it("accepts valid statuses", () => {
    expect(updateSessionSchema.safeParse({ status: "CONFIRMED" }).success).toBe(true);
    expect(updateSessionSchema.safeParse({ status: "CANCELLED" }).success).toBe(true);
    expect(updateSessionSchema.safeParse({ status: "COMPLETED" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(updateSessionSchema.safeParse({ status: "INVALID" }).success).toBe(false);
  });
});

describe("createIntentSchema", () => {
  it("validates correct intent", () => {
    const result = createIntentSchema.safeParse({
      professionalId: "prof-1",
      scheduledAt: "2026-04-01T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("defaults duration to 60", () => {
    const result = createIntentSchema.safeParse({
      professionalId: "prof-1",
      scheduledAt: "2026-04-01T10:00:00Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration).toBe(60);
    }
  });
});
