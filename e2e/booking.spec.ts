import { test, expect, type Page } from "@playwright/test";

const CLIENT_EMAIL = "cliente@guidepath.dev";
const CLIENT_PASSWORD = "password123";

async function loginAsClient(page: Page) {
  await page.goto("/auth/login");
  await page.getByLabel(/email/i).fill(CLIENT_EMAIL);
  await page.getByLabel(/contraseña/i).fill(CLIENT_PASSWORD);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL("**/dashboard/**", { timeout: 15000 });
}

test.describe("Explorar y perfil de profesional", () => {
  test("la página de explorar muestra profesionales", async ({ page }) => {
    await page.goto("/explore");
    await expect(
      page.getByRole("heading", { name: /explorar/i }).first()
    ).toBeVisible();
    await expect(page.locator("[data-pro-card]").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("los filtros de categoría tienen aria-pressed", async ({ page }) => {
    await page.goto("/explore");
    const todosBtn = page.getByRole("button", { name: "Todos" });
    await expect(todosBtn).toHaveAttribute("aria-pressed", "true");
    await todosBtn.click();
    await expect(todosBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("el filtro de categoría cambia el estado aria-pressed", async ({
    page,
  }) => {
    await page.goto("/explore");
    const coachBtn = page.getByRole("button", { name: /coaching ejecutivo/i });
    await expect(coachBtn).toHaveAttribute("aria-pressed", "false");
    await coachBtn.click();
    await expect(coachBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("la búsqueda tiene label accesible", async ({ page }) => {
    await page.goto("/explore");
    const searchInput = page.getByLabel(/buscar profesionales/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("coach");
    await expect(searchInput).toHaveValue("coach");
  });

  test("navegar al perfil de un profesional desde explore", async ({
    page,
  }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    const firstCard = page.locator("[data-pro-card]").first();
    const link = firstCard.locator("a").first();
    await link.click();
    await expect(page).toHaveURL(/\/professional\/.+/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});

test.describe("Booking card — selección de fecha y hora", () => {
  test("la booking card se muestra en el perfil del profesional", async ({
    page,
  }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    await page.locator("[data-pro-card] a").first().click();
    await expect(page).toHaveURL(/\/professional\/.+/);

    // Badge "Sesión gratuita" visible
    await expect(
      page.getByText(/sesión gratuita/i).first()
    ).toBeVisible();
  });

  test("los botones de fecha tienen aria-label descriptivo", async ({
    page,
  }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    await page.locator("[data-pro-card] a").first().click();
    await expect(page).toHaveURL(/\/professional\/.+/);

    const dateButtons = page.locator(
      'button[aria-label*="de"]'
    );
    const count = await dateButtons.count();
    if (count > 0) {
      const label = await dateButtons.first().getAttribute("aria-label");
      expect(label).toMatch(/\d+\s+de\s+\w+/);
    }
  });

  test("seleccionar fecha activa los slots de hora", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    await page.locator("[data-pro-card] a").first().click();
    await expect(page).toHaveURL(/\/professional\/.+/);

    const dateButtons = page.locator('button[aria-label*="de"]');
    const count = await dateButtons.count();

    if (count === 0) {
      test.skip(); // profesional sin disponibilidad
      return;
    }

    await dateButtons.first().click();
    await expect(
      page.getByRole("button", { name: /hora/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("seleccionar fecha y hora habilita el botón de reserva", async ({
    page,
  }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    await page.locator("[data-pro-card] a").first().click();
    await expect(page).toHaveURL(/\/professional\/.+/);

    const dateButtons = page.locator('button[aria-label*="de"]');
    const dateCount = await dateButtons.count();
    if (dateCount === 0) {
      test.skip();
      return;
    }

    await dateButtons.first().click();

    const timeButtons = page.locator('button[aria-label^="Hora"]');
    const timeCount = await timeButtons.count();
    if (timeCount === 0) {
      test.skip();
      return;
    }

    await timeButtons.first().click();

    // Botón de reserva debe estar habilitado (es un Link ahora)
    await expect(
      page.getByRole("link", { name: /reservar sesión/i })
    ).toBeVisible();
  });
});

test.describe("Flujo de reserva completo (autenticado)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
  });

  test("usuario autenticado llega al dashboard tras login", async ({
    page,
  }) => {
    await expect(page).toHaveURL(/\/dashboard\/client/);
  });

  test("desde dashboard puede navegar a explorar", async ({ page }) => {
    await page.getByRole("link", { name: /explorar/i }).first().click();
    await expect(page).toHaveURL(/\/explore/);
    await expect(page.getByRole("heading", { name: /explorar/i })).toBeVisible();
  });

  test("puede iniciar el flujo de reserva completo", async ({ page }) => {
    await page.goto("/explore");
    await page.waitForSelector("[data-pro-card]", { timeout: 10000 });
    await page.locator("[data-pro-card] a").first().click();
    await expect(page).toHaveURL(/\/professional\/.+/);

    const dateButtons = page.locator('button[aria-label*="de"]');
    const dateCount = await dateButtons.count();
    if (dateCount === 0) {
      test.skip();
      return;
    }

    await dateButtons.first().click();

    const timeButtons = page.locator('button[aria-label^="Hora"]');
    const timeCount = await timeButtons.count();
    if (timeCount === 0) {
      test.skip();
      return;
    }

    await timeButtons.first().click();
    await page.getByRole("link", { name: /reservar sesión/i }).click();
    await expect(page).toHaveURL(/\/book\/new\?.+/);
  });
});

test.describe("Protección de rutas", () => {
  test("acceder a /dashboard sin login redirige a login", async ({ page }) => {
    await page.goto("/dashboard/client");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("acceder a /book sin login redirige a login", async ({ page }) => {
    await page.goto("/book/new?professional=test&date=2026-05-01&time=10:00");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
