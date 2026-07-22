import { test, expect } from '@playwright/test';

test.describe('Smoke Tests — Static Pages', () => {
  test('Homepage carga y muestra título', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1, h2, header')).toBeVisible();
  });

  test('Catálogo carga productos', async ({ page }) => {
    const response = await page.goto('/catalog/');
    expect(response?.status()).toBe(200);
  });

  test('Diseño (AI Studio) carga', async ({ page }) => {
    const response = await page.goto('/design/');
    expect(response?.status()).toBe(200);
  });

  test('Página de login carga', async ({ page }) => {
    const response = await page.goto('/login/');
    expect(response?.status()).toBe(200);
  });

  test('Página de contacto carga', async ({ page }) => {
    const response = await page.goto('/contact/');
    expect(response?.status()).toBe(200);
  });

  test('Sitemap XML accesible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('Página 404 muestra error', async ({ page }) => {
    const response = await page.goto('/pagina-que-no-existe-xyz/');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Smoke Tests — API Validation', () => {
  const apiUrl = (path: string) => path;

  test('POST /api/auth/register con password débil retorna 400', async ({ request }) => {
    const res = await request.post('/api/auth/register/', {
      data: {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error || body.message).toBeTruthy();
  });

  test('POST /api/contact sin nombre retorna 400', async ({ request }) => {
    const res = await request.post('/api/contact/', {
      data: {
        email: 'test@example.com',
        message: 'Mensaje de prueba',
      },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /api/admin/orders sin auth retorna 401 o 403', async ({ request }) => {
    const res = await request.get('/api/admin/orders/');
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/checkout sin items retorna 400', async ({ request }) => {
    const res = await request.post('/api/checkout/', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });
});
