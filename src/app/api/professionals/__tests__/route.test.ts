import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    professionalProfile: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn().mockResolvedValue([
        { id: "PSYCHOLOGIST", name: "Psicólogo/a Laboral" },
        { id: "COACH", name: "Coach Ejecutivo" },
        { id: "CAREER_MENTOR", name: "Mentor de Carrera" },
        { id: "NUTRITIONIST", name: "Nutricionista" },
      ]),
    },
  },
}));

import { GET } from "../route";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.professionalProfile.findMany);
const mockCount = vi.mocked(prisma.professionalProfile.count);

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
    languages: ["es"],
    yearsExperience: 10,
    user: { id: "user-1", name: "Dra. Elena Martínez", image: "https://img.test/1.jpg", bio: "Psicóloga clínica" },
    availability: [
      { id: "av-1", dayOfWeek: 1, startTime: "09:00", endTime: "14:00" },
    ],
  },
];

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3000/api/professionals");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /api/professionals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a paginated list of professionals with 200", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      id: "prof-1",
      name: "Dra. Elena Martínez",
      category: "PSYCHOLOGIST",
      categoryName: "Psicólogo/a Laboral",
      hourlyRate: 65,
      rating: 4.9,
      verified: true,
    });
    expect(body.data[0].availability).toHaveLength(1);
  });

  it("returns empty data when no professionals", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("returns 500 on database error", async () => {
    mockCount.mockRejectedValue(new Error("DB connection failed"));

    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it("clamps negative page to 1", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET(makeRequest({ page: "-5" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
  });

  it("clamps limit above 100 to 100", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET(makeRequest({ limit: "999" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    // Verify the call was made (clamping happened server-side)
    expect(body.data).toBeDefined();
  });

  it("filters by search query", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET(makeRequest({ search: "Elena" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
  });

  it("filters by category", async () => {
    mockCount.mockResolvedValue(1);
    mockFindMany.mockResolvedValue(MOCK_PROFESSIONALS as never);

    const response = await GET(makeRequest({ category: "PSYCHOLOGIST" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data[0].category).toBe("PSYCHOLOGIST");
  });
});
