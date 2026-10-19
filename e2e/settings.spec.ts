import { test, expect } from '@playwright/test';
import { mockSettingsApis, stallAllApis } from './fixtures';

test.describe('MainSettingForm', () => {
  test('loaded – FormFieldSet, FormCheckRadio, PageContainer', async ({ page }) => {
    await mockSettingsApis(page);
    await page.goto('/settings/main');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('settings-loaded.png');
  });

  test('success banner – BannerMessage success', async ({ page }) => {
    await mockSettingsApis(page);
    await page.route('**/api/v1/settings/bulk', (route) => route.fulfill({ json: {} }));
    await page.goto('/settings/main');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page).toHaveScreenshot('settings-success-banner.png');
  });

  test('error banner – BannerMessage error', async ({ page }) => {
    await mockSettingsApis(page);
    await page.route('**/api/v1/settings/bulk', (route) =>
      route.fulfill({ status: 500, body: 'Server error' })
    );
    await page.goto('/settings/main');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.alert-danger')).toBeVisible();
    await expect(page).toHaveScreenshot('settings-error-banner.png');
  });

  test('loading state – centered spinner before API responds', async ({ page }) => {
    await stallAllApis(page);
    await page.goto('/settings/main', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Loading settings...');
    await expect(page.getByRole('heading', { name: 'Main Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeHidden();
    await expect(page).toHaveScreenshot('settings-empty-form.png');
  });
});
