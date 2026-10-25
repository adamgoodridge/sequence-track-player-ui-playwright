import { test, expect } from '@playwright/test';
import { mockBookmarksApis } from './fixtures/bookmarks';
import { stallAllApis } from './fixtures/shared';

test.describe('BookmarkListPage', () => {
  test('loaded – ListItem, BootStrapButton', async ({ page }) => {
    await mockBookmarksApis(page);
    await page.goto('/bookmark/list');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('bookmarks-loaded.png');
  });

  test('empty state', async ({ page }) => {
    await page.route('**/api/v1/bookmark', (route) => route.fulfill({ json: [] }));
    await page.goto('/bookmark/list');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('bookmarks-empty.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/bookmark/list', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('bookmarks-loading.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/bookmark', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.goto('/bookmark/list');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('bookmarks-error.png');
  });
});
