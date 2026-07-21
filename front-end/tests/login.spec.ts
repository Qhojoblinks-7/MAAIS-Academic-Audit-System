import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should load login page and bypass splash screen', async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem('splashShown', 'true');
    });
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await expect(page.locator('body')).toContainText('MAAIS');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.context().addInitScript(() => {
      sessionStorage.setItem('splashShown', 'true');
    });
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');
    
    const bodyText = await page.locator('body').textContent();
    expect(
      bodyText?.includes('Invalid credentials') || 
      bodyText?.includes('Network error') ||
      bodyText?.includes('Contact your administrator')
    ).toBe(true);
  });
});
