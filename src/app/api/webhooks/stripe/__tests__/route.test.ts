import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === "stripe-signature") return "test_sig";
      return null;
    }),
  })),
}));

const mockConstructEvent = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_test" },
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/lib/email", () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: { update: vi.fn() },
    professionalProfile: { updateMany: vi.fn() },
  },
}));

import { POST } from "../route";
import { prisma } from "@/lib/prisma";

const mockSessionUpdate = vi.mocked(prisma.session.update);

const makeRequest = (body: string) =>
  new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
  });

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Firma inválida");
  });

  it("handles checkout.session.completed and confirms session", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { sessionId: "sess-1" },
          payment_intent: "pi_123",
        },
      },
    });

    mockSessionUpdate.mockResolvedValue({
      id: "sess-1",
      status: "CONFIRMED",
      stripePaymentIntentId: "pi_123",
      scheduledAt: new Date("2026-04-01T10:00:00Z"),
      price: 65,
      client: { name: "Juan", email: "juan@test.com" },
      professional: { user: { name: "Dr. Pro" } },
    } as never);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mockSessionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sess-1" },
        data: expect.objectContaining({ status: "CONFIRMED" }),
      })
    );
  });

  it("handles checkout.session.expired and cancels session", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.expired",
      data: {
        object: {
          metadata: { sessionId: "sess-2" },
        },
      },
    });

    mockSessionUpdate.mockResolvedValue({
      id: "sess-2",
      status: "CANCELLED",
    } as never);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mockSessionUpdate).toHaveBeenCalledWith({
      where: { id: "sess-2" },
      data: { status: "CANCELLED" },
    });
  });

  it("handles unknown event type gracefully", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.updated",
      data: { object: {} },
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });
});
