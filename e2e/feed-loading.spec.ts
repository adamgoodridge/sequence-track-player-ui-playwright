import { test, expect } from '@playwright/test';
import { stallAllApis } from './fixtures/shared';

test.describe('FeedLoading page', () => {
  test('loading state – LoadingSpinner with description', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/feed/get/random/jazz', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('feed-loading-spinner.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/feed/request/**', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.goto('/feed/get/random/jazz');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed-loading-error.png');
  });

  test('unable to load – ErrorMessage', async ({ page }) => {
    await page.route('**/api/v1/feed/request/**', (route) => route.fulfill({ json: null }));
    await page.goto('/feed/get/random/jazz');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed-loading-unable.png');
  });
});
