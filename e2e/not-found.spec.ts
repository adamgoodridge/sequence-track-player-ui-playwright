import { test, expect } from '@playwright/test';

test.describe('NotFound page', () => {
  test('renders 404 page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('not-found.png');
  });
});
