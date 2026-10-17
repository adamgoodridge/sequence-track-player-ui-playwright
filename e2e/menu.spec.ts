import { test, expect } from '@playwright/test';

test.describe('IPhoneGridPage', () => {
  test('renders grid – MobileNavItem with icons', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('menu-grid.png');
  });

  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('menu-mobile.png');
  });
});
