import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    professionalProfile: {
      findUnique: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "../route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getServerSession);
const mockProfileFindUnique = vi.mocked(prisma.professionalProfile.findUnique);
const mockSessionFindMany = vi.mocked(prisma.session.findMany);

describe("GET /api/sessions", () => {
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

  it("returns client sessions with professional info", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindMany.mockResolvedValue([
      {
        id: "sess-1",
        clientId: "client-1",
        professionalId: "prof-1",
        scheduledAt: new Date("2025-01-15T10:00:00Z"),
        duration: 60,
        status: "CONFIRMED",
        price: 65,
        dailyRoomUrl: null,
        professional: {
          user: { id: "user-1", name: "Dra. Elena", image: "https://img.test/1.jpg" },
        },
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].professionalName).toBe("Dra. Elena");
    expect(data[0].status).toBe("CONFIRMED");
  });

  it("returns professional sessions with client info", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-pro", role: "PROFESSIONAL", name: "Pro", email: "p@t.com" },
      expires: "2099-01-01",
    } as never);

    mockProfileFindUnique.mockResolvedValue({
      id: "prof-1",
      userId: "user-pro",
    } as never);

    mockSessionFindMany.mockResolvedValue([
      {
        id: "sess-2",
        clientId: "client-1",
        professionalId: "prof-1",
        scheduledAt: new Date("2025-01-15T10:00:00Z"),
        duration: 60,
        status: "PENDING",
        price: 65,
        dailyRoomUrl: null,
        client: { id: "client-1", name: "Juan García", image: "" },
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].clientName).toBe("Juan García");
    expect(data[0].status).toBe("PENDING");
  });

  it("returns 500 on database error", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "client-1", role: "CLIENT", name: "Test", email: "t@t.com" },
      expires: "2099-01-01",
    } as never);

    mockSessionFindMany.mockRejectedValue(new Error("DB error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
