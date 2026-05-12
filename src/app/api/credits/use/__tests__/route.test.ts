import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/emails", () => ({ sendBookingEmails: vi.fn() }));
vi.mock("@/lib/notifications", () => ({ createNotifications: vi.fn() }));
vi.mock("@/lib/sanitize", () => ({ stripHtml: (s: string) => s }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/lib/prisma", () => {
  const mockTx = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    session: { count: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    blockedDate: { findFirst: vi.fn() },
    availability: { findFirst: vi.fn() },
  };
  return {
    prisma: {
      professionalProfile: { findUnique: vi.fn() },
      $transaction: vi.fn(async (cb: (tx: typeof mockTx) => unknown) => cb(mockTx)),
      __mockTx: mockTx,
    },
  };
});

import { POST } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockTx = (prisma as unknown as { __mockTx: {
  user: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  session: { count: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  blockedDate: { findFirst: ReturnType<typeof vi.fn> };
  availability: { findFirst: ReturnType<typeof vi.fn> };
} }).__mockTx;
const mockProFindUnique = vi.mocked(prisma.professionalProfile.findUnique);

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/credits/use", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/credits/use", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ professionalId: "p1", scheduledAt: new Date(Date.now() + 86400_000).toISOString() }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when scheduledAt is in the past", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    const res = await POST(makeRequest({ professionalId: "p1", scheduledAt: new Date(Date.now() - 86400_000).toISOString() }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/pasado/i);
  });

  it("returns 403 CREDITS_EXHAUSTED when free tier user already used 3 sessions this month", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockProFindUnique.mockResolvedValue({
      id: "p1",
      userId: "pro-user",
      user: { id: "pro-user", name: "Pro", email: "pro@test.com" },
    } as never);

    // Same month → currentUsed stays at 3, exceeds FREE limit (3)
    mockTx.user.findUnique.mockResolvedValue({
      freeCreditsUsed:  3,
      creditsResetAt:   new Date(),
      name:             "Test",
      email:            "t@t.com",
      subscriptionTier: "FREE",
    });

    const res  = await POST(makeRequest({ professionalId: "p1", scheduledAt: new Date(Date.now() + 86400_000).toISOString() }));
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error).toMatch(/agotado/i);
  });

  it("auto-resets credits when month rolled over", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockProFindUnique.mockResolvedValue({
      id: "p1",
      userId: "pro-user",
      user: { id: "pro-user", name: "Pro", email: "pro@test.com" },
    } as never);

    // creditsResetAt is from a year ago → triggers monthly reset
    mockTx.user.findUnique.mockResolvedValue({
      freeCreditsUsed:  3,
      creditsResetAt:   new Date(Date.now() - 365 * 86400_000),
      name:             "Test",
      email:            "t@t.com",
      subscriptionTier: "FREE",
    });
    mockTx.session.count.mockResolvedValue(0);
    mockTx.blockedDate.findFirst.mockResolvedValue(null);
    mockTx.availability.findFirst.mockResolvedValue(null);
    mockTx.session.findFirst.mockResolvedValue(null);
    mockTx.session.create.mockResolvedValue({
      id: "s1",
      scheduledAt: new Date(Date.now() + 86400_000),
    });
    mockTx.user.update.mockResolvedValue({});

    const res = await POST(makeRequest({ professionalId: "p1", scheduledAt: new Date(Date.now() + 86400_000).toISOString() }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.creditsRemaining).toBe(2); // 3 - 1 (after auto-reset)
  });
});
