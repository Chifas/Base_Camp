import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/emails", () => ({
  sendCancellationEmails: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: { refunds: { create: vi.fn() } },
}));

vi.mock("@/lib/cancellation", () => ({
  calculateCancellation: vi.fn().mockReturnValue({ refundPercent: 100, fee: 0 }),
}));

vi.mock("@/lib/notifications", () => ({
  createNotifications: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { PATCH } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockSessionFindUnique = vi.mocked(prisma.session.findUnique);
const mockSessionUpdate = vi.mocked(prisma.session.update);

const makeRequest = (body: object) =>
  new Request("http://localhost/api/sessions/sess-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockSession = {
  id: "sess-1",
  clientId: "client-1",
  professionalId: "prof-1",
  status: "PENDING",
  scheduledAt: new Date(),
  price: 65,
  professional: {
    userId: "pro-user-1",
    user: { id: "pro-user-1", name: "Dr. Test", email: "pro@test.com" },
  },
  client: { id: "client-1", name: "Client Test", email: "client@test.com" },
};

describe("PATCH /api/sessions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await PATCH(makeRequest({ status: "CONFIRMED" }), {
      params: { id: "sess-1" },
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 when client tries to confirm", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Client", email: "c@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue(mockSession as never);

    const response = await PATCH(makeRequest({ status: "CONFIRMED" }), {
      params: { id: "sess-1" },
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("profesional");
  });

  it("returns 403 when client tries to complete", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Client", email: "c@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      ...mockSession,
      status: "CONFIRMED",
    } as never);

    const response = await PATCH(makeRequest({ status: "COMPLETED" }), {
      params: { id: "sess-1" },
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain("profesional");
  });

  it("allows professional to confirm a PENDING session", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "pro-user-1", role: "PROFESSIONAL", name: "Pro", email: "p@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue(mockSession as never);
    mockSessionUpdate.mockResolvedValue({ ...mockSession, status: "CONFIRMED" } as never);

    const response = await PATCH(makeRequest({ status: "CONFIRMED" }), {
      params: { id: "sess-1" },
    });

    expect(response.status).toBe(200);
    expect(mockSessionUpdate).toHaveBeenCalledWith({
      where: { id: "sess-1" },
      data: { status: "CONFIRMED" },
    });
  });

  it("rejects invalid status transition (COMPLETED → CONFIRMED)", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "pro-user-1", role: "PROFESSIONAL", name: "Pro", email: "p@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      ...mockSession,
      status: "COMPLETED",
    } as never);

    const response = await PATCH(makeRequest({ status: "CONFIRMED" }), {
      params: { id: "sess-1" },
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("No se puede cambiar");
  });

  it("rejects invalid status transition (CANCELLED → CONFIRMED)", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "pro-user-1", role: "PROFESSIONAL", name: "Pro", email: "p@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      ...mockSession,
      status: "CANCELLED",
    } as never);

    const response = await PATCH(makeRequest({ status: "CONFIRMED" }), {
      params: { id: "sess-1" },
    });

    expect(response.status).toBe(400);
  });

  it("allows either party to cancel", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Client", email: "c@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue(mockSession as never);
    mockSessionUpdate.mockResolvedValue({ ...mockSession, status: "CANCELLED" } as never);

    const response = await PATCH(makeRequest({ status: "CANCELLED" }), {
      params: { id: "sess-1" },
    });

    expect(response.status).toBe(200);
  });
});
