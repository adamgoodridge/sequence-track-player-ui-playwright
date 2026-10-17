import { test, expect } from '@playwright/test';
import { mockStatsApis, stallAllApis } from './fixtures';

test.describe('StatsPage', () => {
  test('loaded – DatePicker, DateRangePieChart, StatsCard, StatsList', async ({ page }) => {
    await mockStatsApis(page);
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('stats-loaded.png');
  });

  test('no data state', async ({ page }) => {
    await page.route('**/api/v1/statistic/summary/week**', (route) =>
      route.fulfill({ json: { length: 0, feedCounts: [], weekSummaries: [], totalLength: '0' } })
    );
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('stats-no-data.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/stats', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('stats-loading.png');
  });

  test('error state – ErrorAlert', async ({ page }) => {
    await page.route('**/api/v1/statistic/summary/week**', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('stats-error.png');
  });

  test('DatePicker atom isolated', async ({ page }) => {
    await mockStatsApis(page);
    await page.goto('/stats');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.mb-4').first()).toHaveScreenshot('stats-date-pickers.png');
  });
});
