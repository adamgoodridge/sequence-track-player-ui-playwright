import { test, expect } from '@playwright/test';
import { mockBookmarksApis } from './fixtures/bookmarks';
import { stallAllApis } from './fixtures/shared';

async function waitForBookmarkScreenReady(page: Parameters<typeof test>[0]['page']) {
  await page.waitForLoadState('networkidle');
  // Let layout effects and ResizeObserver-driven nav spacing settle before snapshotting.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  await expect(page.locator('body')).not.toContainText('[plugin:vite:import-analysis]');
}

test.describe('BookmarkListPage', () => {
  test('loaded – ListItem, BootStrapButton', async ({ page }) => {
    await mockBookmarksApis(page);
    await page.goto('/bookmark/list');
    await expect(page.getByRole('heading', { name: 'Bookmarks' })).toBeVisible();
    await waitForBookmarkScreenReady(page);
    await expect(page).toHaveScreenshot('bookmarks-loaded.png');
  });

  test('empty state', async ({ page }) => {
    await page.route('**/api/v1/bookmark', (route) => route.fulfill({ json: [] }));
    await page.goto('/bookmark/list');
    await expect(page.getByText('No bookmarks saved yet.')).toBeVisible();
    await waitForBookmarkScreenReady(page);
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
