import { test, expect } from '@playwright/test';
import { mockHomeListApis, mockHomeIconApis } from './fixtures/home';
import { stallAllApis } from './fixtures/shared';

test.describe('HomePage', () => {
  test('list view – Shortcuts, ListShortcuts, ListItem, Navigation', async ({ page }) => {
    await mockHomeListApis(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-list-view.png');
  });

  test('icon grid view – IconGrid, IconInGrid, SoftBox', async ({ page }) => {
    await mockHomeIconApis(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const itemCenterOffsets = await page.locator('.icon-grid-item').evaluateAll((items) =>
      items.map((item) => {
        const image = item.querySelector('img');
        const title = item.querySelector('.icon-grid-title');
        if (!image || !title) {
          throw new Error('Icon grid item is missing its image or title');
        }

        const itemBounds = item.getBoundingClientRect();
        const imageBounds = image.getBoundingClientRect();
        const titleBounds = title.getBoundingClientRect();
        const itemCenter = itemBounds.left + itemBounds.width / 2;
        const imageCenter = imageBounds.left + imageBounds.width / 2;
        const titleCenter = titleBounds.left + titleBounds.width / 2;
        return { imageOffset: imageCenter - itemCenter, titleOffset: titleCenter - itemCenter };
      })
    );
    expect(
      itemCenterOffsets.every(
        ({ imageOffset, titleOffset }) => Math.abs(imageOffset) <= 1 && Math.abs(titleOffset) <= 1
      )
    ).toBe(true);
    await expect(page).toHaveScreenshot('home-icon-view.png');
  });

  test('loading state – LoadingSpinner', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.spinner-border')).toBeVisible();
    await expect(page).toHaveScreenshot('home-loading.png');
  });

  test('error state – ErrorAlert, PageContainer', async ({ page }) => {
    await page.route('**/api/v1/settings/logo_view', (route) =>
      route.fulfill({ status: 500, body: 'error' })
    );
    await page.route('**/api/v1/shortcut**', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/v1/commit-time', (route) =>
      route.fulfill({ json: { commitTime: '' } })
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-error.png');
  });

  test('desktop navigation – DesktopNavigation, Brand, NavList, NavLink', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockHomeListApis(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav').first()).toHaveScreenshot('desktop-nav.png');
  });

  test('mobile navigation – MobileNavigation, MobileNavList, MobileNavItem', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockHomeListApis(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toHaveScreenshot(
      'mobile-nav.png'
    );
  });
});
