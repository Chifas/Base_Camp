import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
    },
    review: {
      create: vi.fn(),
    },
    professionalProfile: {
      update: vi.fn(),
    },
  },
}));

import { POST } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockSessionFindUnique = vi.mocked(prisma.session.findUnique);
const mockReviewCreate = vi.mocked(prisma.review.create);
const mockProfileUpdate = vi.mocked(prisma.professionalProfile.update);

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

  it("creates review and updates rating successfully", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "u1", role: "CLIENT" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindUnique.mockResolvedValue({
      id: "s1",
      clientId: "u1",
      professionalId: "p1",
      status: "COMPLETED",
      professional: {
        id: "p1",
        rating: 4.0,
        reviewCount: 10,
      },
    } as never);

    mockReviewCreate.mockResolvedValue({
      id: "rev-1",
      sessionId: "s1",
      userId: "u1",
      professionalId: "p1",
      rating: 5,
      comment: "Excellent!",
      createdAt: new Date(),
    } as never);

    mockProfileUpdate.mockResolvedValue({} as never);

    const res = await POST(makeRequest({ sessionId: "s1", rating: 5, comment: "Excellent!" }));
    expect(res.status).toBe(201);

    // Verify rating was updated with incremental formula
    expect(mockProfileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({
          reviewCount: 11,
        }),
      })
    );
  });
});
