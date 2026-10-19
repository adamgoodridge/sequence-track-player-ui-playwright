import { test, expect } from '@playwright/test';
import { mockFeedApis, stallAllApis } from './fixtures';

test.describe('FeedPage', () => {
  test('loaded – FeedView, FeedTitleSection, FeedPlayerSection, BottomRowButtons', async ({
    page,
  }) => {
    await mockFeedApis(page, 42);
    await page.goto('/feed/42');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed-loaded.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/feed/42', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('feed-loading.png');
  });

  test('invalid ID – RenderIdNotNumberError, ErrorAlert', async ({ page }) => {
    await page.goto('/feed/not-a-number');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed-invalid-id.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/feed/ownership/42', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.goto('/feed/42');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('feed-error.png');
  });

  test('FeedTitleSection isolated', async ({ page }) => {
    await mockFeedApis(page, 42);
    await page.goto('/feed/42');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toHaveScreenshot('feed-title-section.png');
  });

  test('BottomRowButtons isolated', async ({ page }) => {
    await mockFeedApis(page, 42);
    await page.goto('/feed/42');
    await page.waitForLoadState('networkidle');
    const buttons = page
      .locator('div')
      .filter({ has: page.locator('button') })
      .last();
    await expect(buttons).toHaveScreenshot('feed-bottom-row-buttons.png');
  });
});
