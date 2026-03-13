import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    professionalProfile: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "../route";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.professionalProfile.findMany);

const MOCK_PROFESSIONALS = [
  {
    id: "prof-1",
    userId: "user-1",
    headline: "Psicóloga Clínica",
    category: "PSYCHOLOGIST",
    hourlyRate: 65,
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    user: { id: "user-1", name: "Dra. Elena Martínez", image: "https://img.test/1.jpg", bio: "Psicóloga clínica" },
    availability: [
      { id: "av-1", dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
    ],
  },
];

describe("GET /api/professionals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a list of professionals with 200", async () => {
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: "prof-1",
      name: "Dra. Elena Martínez",
      category: "PSYCHOLOGIST",
      hourlyRate: 65,
      rating: 4.9,
      verified: true,
    });
    expect(data[0].availability).toHaveLength(1);
  });

  it("returns an empty array when no professionals", async () => {
    mockFindMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockFindMany.mockRejectedValue(new Error("DB connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
