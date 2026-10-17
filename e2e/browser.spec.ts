import { test, expect } from '@playwright/test';
import { mockBrowserApis, stallAllApis } from './fixtures';

test.describe('BrowserPage', () => {
  test('file list – BrowserFileList, List, Breadcrumbs, BreadcrumbLink, BreadcrumbLast', async ({ page }) => {
    await mockBrowserApis(page, false);
    await page.goto('/browser');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('browser-file-list.png');
  });

  test('year calendar view – YearCalendarView', async ({ page }) => {
    await mockBrowserApis(page, true);
    await page.goto('/browser');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('browser-year-view.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/browser', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('browser-loading.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/browser-items**', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.route('**/api/v1/shortcut**', (route) =>
      route.fulfill({ json: [] })
    );
    await page.goto('/browser');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('browser-error.png');
  });

  test('Breadcrumbs isolated', async ({ page }) => {
    await mockBrowserApis(page, false);
    await page.goto('/browser');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toHaveScreenshot('breadcrumbs.png');
  });
});
