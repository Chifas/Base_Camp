import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/emails", () => ({
  sendNewReviewEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => {
  const mockTx = {
    review: {
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    professionalProfile: {
      update: vi.fn(),
    },
  };
  return {
    prisma: {
      session: {
        findUnique: vi.fn(),
      },
      review: {
        create: vi.fn(),
      },
      professionalProfile: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
      __mockTx: mockTx,
    },
  };
});

import { POST } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockSessionFindUnique = vi.mocked(prisma.session.findUnique);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTx = (prisma as any).__mockTx;

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ sessionId: "s1", rating: 5, comment: "Great" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when rating is out of range", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);

    const res = await POST(makeRequest({ sessionId: "s1", rating: 6, comment: "Great" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when sessionId is missing", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);

    const res = await POST(makeRequest({ rating: 5, comment: "Great" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when session not found", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);
    mockSessionFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ sessionId: "bad-id", rating: 5, comment: "Great" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when user is not the client", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "other-user", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      id: "s1",
      clientId: "u1",
      professionalId: "p1",
      status: "COMPLETED",
      review: null,
      professional: { user: { id: "pro-user", name: "Pro", email: "pro@test.com" } },
      client: { name: "Client" },
    } as never);

    const res = await POST(makeRequest({ sessionId: "s1", rating: 5, comment: "Great" }));
    expect(res.status).toBe(403);
  });

  it("creates review successfully", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      id: "s1",
      clientId: "u1",
      professionalId: "p1",
      status: "COMPLETED",
      review: null,
      professional: { user: { id: "pro-user", name: "Pro", email: "pro@test.com" } },
      client: { name: "Test Client" },
    } as never);

    const createdReview = {
      id: "rev-1",
      sessionId: "s1",
      userId: "u1",
      rating: 5,
      comment: "Excellent!",
      createdAt: new Date(),
    };

    mockTx.review.create.mockResolvedValue(createdReview as never);
    mockTx.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: { rating: 11 },
    } as never);
    mockTx.professionalProfile.update.mockResolvedValue({} as never);

    const res = await POST(makeRequest({ sessionId: "s1", rating: 5, comment: "Excellent!" }));
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toBe("rev-1");
    expect(data.rating).toBe(5);
  });
});
