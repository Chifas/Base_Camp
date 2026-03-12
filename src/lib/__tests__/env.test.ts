import { describe, it, expect, vi, beforeEach } from "vitest";

const VALID_ENV = {
  NEXTAUTH_SECRET: "test-secret-key-very-long",
  NEXTAUTH_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/test",
};

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("succeeds when all required vars are present", async () => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      vi.stubEnv(key, value);
    }
    const { env } = await import("../env");
    expect(env.NEXTAUTH_SECRET).toBe(VALID_ENV.NEXTAUTH_SECRET);
    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL);
  });

  it("throws when NEXTAUTH_SECRET is missing", async () => {
    vi.stubEnv("NEXTAUTH_URL", VALID_ENV.NEXTAUTH_URL);
    vi.stubEnv("DATABASE_URL", VALID_ENV.DATABASE_URL);
    vi.stubEnv("DIRECT_URL", VALID_ENV.DIRECT_URL);
    vi.stubEnv("NEXTAUTH_SECRET", "");

    await expect(import("../env")).rejects.toThrow("NEXTAUTH_SECRET");
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", VALID_ENV.NEXTAUTH_SECRET);
    vi.stubEnv("NEXTAUTH_URL", VALID_ENV.NEXTAUTH_URL);
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DIRECT_URL", VALID_ENV.DIRECT_URL);

    await expect(import("../env")).rejects.toThrow("DATABASE_URL");
  });

  it("throws when NEXTAUTH_URL is not a valid URL", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", VALID_ENV.NEXTAUTH_SECRET);
    vi.stubEnv("NEXTAUTH_URL", "not-a-url");
    vi.stubEnv("DATABASE_URL", VALID_ENV.DATABASE_URL);
    vi.stubEnv("DIRECT_URL", VALID_ENV.DIRECT_URL);

    await expect(import("../env")).rejects.toThrow("NEXTAUTH_URL");
  });

  it("succeeds without optional vars", async () => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      vi.stubEnv(key, value);
    }
    const { env } = await import("../env");
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
    expect(env.STRIPE_SECRET_KEY).toBeUndefined();
  });
});
