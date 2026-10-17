import { test, expect } from '@playwright/test';
import { mockCurrentFeedsApis, stallAllApis } from './fixtures';

test.describe('CurrentFeeds page', () => {
  test('loaded – ListCurrentFeeds, List, ListItem', async ({ page }) => {
    await mockCurrentFeedsApis(page);
    await page.goto('/feed/list/current');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-feeds-loaded.png');
  });

  test('empty state', async ({ page }) => {
    await page.route('**/api/v1/feed/current**', (route) =>
      route.fulfill({ json: { count: 0, sortByFeedResponse: [] } })
    );
    await page.goto('/feed/list/current');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-feeds-empty.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/feed/list/current', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('current-feeds-loading.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/feed/current**', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.goto('/feed/list/current');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('current-feeds-error.png');
  });
});
