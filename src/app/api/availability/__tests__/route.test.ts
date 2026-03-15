import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    professionalProfile: {
      findUnique: vi.fn(),
    },
    availability: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { GET, PUT } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockProfileFindUnique = vi.mocked(prisma.professionalProfile.findUnique);
const mockAvailabilityFindMany = vi.mocked(prisma.availability.findMany);

describe("GET /api/availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it("returns 404 when no professional profile", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "PROFESSIONAL", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockProfileFindUnique.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain("no encontrado");
  });

  it("returns availability slots for authenticated professional", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "PROFESSIONAL", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    const mockSlots = [
      { id: "a1", professionalId: "prof-1", dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
      { id: "a2", professionalId: "prof-1", dayOfWeek: 2, startTime: "09:00", endTime: "14:00" },
    ];

    mockProfileFindUnique.mockResolvedValue({
      id: "prof-1",
      userId: "user-1",
      availability: mockSlots,
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].dayOfWeek).toBe(1);
  });
});

describe("PUT /api/availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new Request("http://localhost/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: [] }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid slot format", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "PROFESSIONAL", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    const request = new Request("http://localhost/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots: [{ dayOfWeek: 8, startTime: "bad", endTime: "bad", enabled: true }] }),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it("saves only enabled slots with valid times", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "PROFESSIONAL", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockProfileFindUnique.mockResolvedValue({
      id: "prof-1",
      userId: "user-1",
    } as never);

    const mockTransaction = vi.mocked(prisma.$transaction);
    mockTransaction.mockResolvedValue(undefined as never);

    const savedSlots = [
      { id: "a1", professionalId: "prof-1", dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
    ];
    mockAvailabilityFindMany.mockResolvedValue(savedSlots as never);

    const request = new Request("http://localhost/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slots: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", enabled: true },
          { dayOfWeek: 2, startTime: "09:00", endTime: "14:00", enabled: false },
          { dayOfWeek: 0, startTime: "", endTime: "", enabled: false },
        ],
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(data).toHaveLength(1);
  });
});
