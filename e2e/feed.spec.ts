import { test, expect } from '@playwright/test';
import { mockFeedApis } from './fixtures/feed';
import { stallAllApis } from './fixtures/shared';

test.describe('FeedPage', () => {
  test('regular change button is red when the API value is true', async ({ page }) => {
    await mockFeedApis(page, 42);
    await page.route('**/api/v1/settings/regularly_change_to_random', (route) =>
      route.fulfill({ json: { name: 'regularly_change_to_random', value: true } })
    );
    await page.goto('/feed/42');

    const button = page.getByRole('button', { name: /Turn (On|Off) regular change track/ });
    await expect(button).toHaveClass(/\bbtn-danger\b/);
    await expect(button).toHaveCSS('background-color', 'rgb(220, 53, 69)');
    await expect(button).toHaveText('Turn Off regular change track');
    await expect(button).toHaveScreenshot('regular-change-enabled.png');
  });

  test('regular change button follows the API value when toggled', async ({ page }) => {
    await mockFeedApis(page, 42);
    let value = false;
    await page.route('**/api/v1/settings/regularly_change_to_random', async (route) => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON();
        expect(body).toEqual({ value: !value });
        value = body.value;
      }
      await route.fulfill({
        json: { name: 'regularly_change_to_random', value, booleanValue: !value },
      });
    });
    await page.goto('/feed/42');

    const button = page.getByRole('button', { name: /Turn (On|Off) regular change track/ });
    await expect(button).toHaveText('Turn On regular change track');
    await expect(button).toHaveClass(/\bbtn-primary\b/);
    await button.click();
    await expect(button).toHaveText('Turn Off regular change track');
    await expect(button).toHaveClass(/\bbtn-danger\b/);
    await button.click();
    await expect(button).toHaveText('Turn On regular change track');
    await expect(button).toHaveClass(/\bbtn-primary\b/);
  });

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
