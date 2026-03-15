import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_password") },
}));

import { POST } from "../route";
import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockCreate = vi.mocked(prisma.user.create);

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "12345678" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST(makeRequest({ name: "Test", email: "not-email", password: "12345678" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(makeRequest({ name: "Test", email: "a@b.com", password: "123" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing" } as never);

    const res = await POST(makeRequest({ name: "Test", email: "a@b.com", password: "12345678" }));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("ya está registrado");
  });

  it("creates user successfully", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "new-user",
      name: "Test User",
      email: "a@b.com",
      role: "CLIENT",
    } as never);

    const res = await POST(
      makeRequest({ name: "Test User", email: "a@b.com", password: "12345678" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("creates professional user when role=PROFESSIONAL", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "new-pro",
      name: "Pro User",
      email: "pro@b.com",
      role: "PROFESSIONAL",
    } as never);

    const res = await POST(
      makeRequest({ name: "Pro User", email: "pro@b.com", password: "12345678", role: "PROFESSIONAL" })
    );
    expect(res.status).toBe(200);
  });
});
