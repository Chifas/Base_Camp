import { test, expect } from "@playwright/test";

test.describe("Registro e inicio de sesión", () => {
  const testEmail = `e2e-${Date.now()}@test.com`;
  const testPassword = "TestPassword123";
  const testName = "E2E Test User";

  test("debe mostrar la página de registro", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: /crea tu cuenta/i })).toBeVisible();
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test("debe mostrar errores de validación en campos vacíos", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.locator("text=obligatorio").first()).toBeVisible();
  });

  test("debe mostrar error con contraseña corta", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByLabel(/nombre completo/i).fill(testName);
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill("123");
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await expect(page.locator("text=8 caracteres")).toBeVisible();
  });

  test("debe registrar un usuario nuevo como cliente", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByLabel(/nombre completo/i).fill(testName);
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole("button", { name: /crear cuenta/i }).click();

    // Should redirect to client dashboard
    await page.waitForURL("**/dashboard/client", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /mi panel/i })).toBeVisible();
  });

  test("debe mostrar la página de login", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /iniciar sesión/i })).toBeVisible();
  });

  test("debe iniciar sesión con un usuario existente", async ({ page }) => {
    // First register
    await page.goto("/auth/register");
    const email = `e2e-login-${Date.now()}@test.com`;
    await page.getByLabel(/nombre completo/i).fill("Login Test");
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole("button", { name: /crear cuenta/i }).click();
    await page.waitForURL("**/dashboard/client", { timeout: 15000 });

    // Logout (navigate to login)
    await page.goto("/auth/login");

    // Login
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/contraseña/i).fill(testPassword);
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
  });
});

test.describe("Explorar profesionales", () => {
  test("debe mostrar la página de exploración", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.getByRole("heading", { name: /explorar/i }).first()).toBeVisible();
  });
});

test.describe("Landing page", () => {
  test("debe cargar la página principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByText(/empezar gratis/i).first()).toBeVisible();
  });

  test("debe navegar a explorar desde CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByText(/explorar profesionales/i).first().click();
    await page.waitForURL("**/explore");
  });
});
