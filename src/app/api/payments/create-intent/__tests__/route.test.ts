import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const mockPaymentIntentsCreate = vi.fn();
vi.mock("@/lib/stripe", () => ({
  stripe: {
    paymentIntents: { create: (...args: unknown[]) => mockPaymentIntentsCreate(...args) },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    professionalProfile: { findUnique: vi.fn() },
    session: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

import { POST } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockProfileFind = vi.mocked(prisma.professionalProfile.findUnique);
const mockSessionFirst = vi.mocked(prisma.session.findFirst);
const mockSessionCreate = vi.mocked(prisma.session.create);
const mockSessionUpdate = vi.mocked(prisma.session.update);

const makeRequest = (body: object) =>
  new Request("http://localhost/api/payments/create-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  professionalId: "prof-1",
  scheduledAt: "2026-04-01T10:00:00Z",
  duration: 60,
};

describe("POST /api/payments/create-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT", name: "T", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    const res = await POST(makeRequest({ professionalId: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when professional not found", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT", name: "T", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);
    mockProfileFind.mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 400 when booking yourself", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "same-user", role: "CLIENT", name: "T", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);
    mockProfileFind.mockResolvedValue({
      hourlyRate: 65,
      userId: "same-user",
      user: { name: "Self" },
    } as never);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("contigo mismo");
  });

  it("returns 409 on scheduling conflict", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT", name: "T", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);
    mockProfileFind.mockResolvedValue({
      hourlyRate: 65,
      userId: "pro-user",
      user: { name: "Pro" },
    } as never);
    mockSessionFirst.mockResolvedValue({ id: "existing" } as never);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("creates session and payment intent successfully", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT", name: "T", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);
    mockProfileFind.mockResolvedValue({
      hourlyRate: 65,
      userId: "pro-user",
      user: { name: "Dr. Pro" },
    } as never);
    mockSessionFirst.mockResolvedValue(null);
    mockSessionCreate.mockResolvedValue({
      id: "sess-new",
      clientId: "u1",
      professionalId: "prof-1",
      status: "PENDING",
    } as never);
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret",
    });
    mockSessionUpdate.mockResolvedValue({} as never);

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.clientSecret).toBe("pi_123_secret");
    expect(data.sessionId).toBe("sess-new");
    expect(data.amount).toBe(65);
    expect(mockSessionCreate).toHaveBeenCalledOnce();
    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 6500,
        currency: "eur",
      })
    );
  });
});
