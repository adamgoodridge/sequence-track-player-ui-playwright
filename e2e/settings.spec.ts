import { test, expect } from '@playwright/test';
import { mockSettingsApis } from './fixtures/settings';
import { stallAllApis } from './fixtures/shared';

test.describe('MainSettingForm', () => {
  test('radio options fill their column and have full-row tap targets', async ({ page }) => {
    await mockSettingsApis(page);
    await page.goto('/settings/main');
    const option = page.locator('label[for="logo_view-true"]');
    await expect(option).toBeVisible();
    const labelBounds = await option.boundingBox();
    const fieldsetBounds = await page.locator('fieldset').first().boundingBox();
    if (!labelBounds || !fieldsetBounds) {
      throw new Error('Radio option or fieldset has no layout bounds');
    }
    expect(labelBounds.height).toBeGreaterThanOrEqual(48);
    const columns = await page.evaluate(() => (window.innerWidth >= 768 ? 2 : 1));
    const columnGap = columns === 2 ? 12 : 0;
    expect(
      Math.abs(labelBounds.width * columns + columnGap - fieldsetBounds.width)
    ).toBeLessThanOrEqual(1);
    await option.click({
      position: { x: labelBounds.width - 8, y: labelBounds.height / 2 },
    });
    await expect(page.getByRole('radio', { name: 'Enabled', exact: true })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Disabled', exact: true })).not.toBeChecked();
  });

  test('loaded – FormFieldSet, FormCheckRadio, PageContainer', async ({ page }) => {
    await mockSettingsApis(page);
    await page.goto('/settings/main');
    await page.waitForLoadState('networkidle');
    const exampleSetting = page
      .locator('fieldset')
      .filter({ has: page.getByText('Playback Day (Example)', { exact: true }) });
    await expect(exampleSetting.getByRole('radio')).toHaveCount(1);
    await expect(exampleSetting.getByRole('radio', { name: 'Monday', exact: true })).toBeChecked();
    await expect(page).toHaveScreenshot('settings-loaded.png');
  });

  test('clicking the setting title reveals every option without changing the selection', async ({
    page,
  }) => {
    await mockSettingsApis(page);
    await page.goto('/settings/main');
    const setting = page.getByRole('group', { name: 'Playback Day (Example)' });
    const toggle = setting.getByRole('button', { name: 'Playback Day (Example)' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(setting.getByRole('radio')).toHaveCount(1);

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(setting.getByRole('radio')).toHaveCount(7);
    const optionBounds = await setting.locator('.radio-option').evaluateAll((options) =>
      options.map((option) => {
        const { x, y } = option.getBoundingClientRect();
        return { x, y };
      })
    );
    const desktop = await page.evaluate(() => window.innerWidth >= 768);
    if (desktop) {
      expect(optionBounds[0].y).toBe(optionBounds[1].y);
      expect(optionBounds[1].x).toBeGreaterThan(optionBounds[0].x);
      expect(optionBounds[2].x).toBe(optionBounds[0].x);
      expect(optionBounds[2].y).toBeGreaterThan(optionBounds[0].y);
    } else {
      expect(optionBounds[1].x).toBe(optionBounds[0].x);
      expect(optionBounds[1].y).toBeGreaterThan(optionBounds[0].y);
    }
    for (const day of [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]) {
      await expect(setting.getByRole('radio', { name: day, exact: true })).toBeVisible();
    }
    await expect(setting.getByRole('radio', { checked: true })).toHaveCount(1);
    await expect(setting.getByRole('radio', { name: 'Monday', exact: true })).toBeChecked();
    await expect(page.locator('.alert-success')).toBeHidden();
    await expect(setting).toHaveScreenshot('settings-expanded-options.png');
  });

  test('setting title supports keyboard expansion and collapse', async ({ page }) => {
    await mockSettingsApis(page);
    await page.goto('/settings/main');
    const setting = page.getByRole('group', { name: 'Playback Day (Example)' });
    const toggle = setting.getByRole('button', { name: 'Playback Day (Example)' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(setting.getByRole('radio')).toHaveCount(7);
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(setting.getByRole('radio')).toHaveCount(1);
    await expect(page.getByRole('group', { name: 'Logo View' }).getByRole('button')).toHaveCount(0);
  });

  test('settings with more than two options collapse to the current selection', async ({
    page,
  }) => {
    await mockSettingsApis(page);
    let savedSettings: unknown;
    await page.route('**/api/v1/settings/bulk', (route) => {
      savedSettings = route.request().postDataJSON();
      return route.fulfill({ json: {} });
    });
    await page.goto('/settings/main');
    const setting = page.getByRole('group', { name: 'Playback Day (Example)' });
    await expect(setting.getByRole('radio')).toHaveCount(1);
    await expect(setting.getByRole('radio', { name: 'Monday', exact: true })).toBeChecked();
    await expect(page.getByRole('group', { name: 'Logo View' }).getByRole('radio')).toHaveCount(2);

    await setting.getByRole('button', { name: 'Playback Day (Example)' }).click();
    await expect(setting.getByRole('radio')).toHaveCount(7);
    await setting.getByRole('radio', { name: 'Friday', exact: true }).check();
    await setting.getByRole('button', { name: 'Playback Day (Example)' }).click();
    await expect(setting.getByRole('radio')).toHaveCount(1);
    await expect(setting.getByRole('radio', { name: 'Friday', exact: true })).toBeChecked();
    await expect(setting.getByRole('button')).toHaveAttribute('aria-expanded', 'false');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.alert-success')).toBeVisible();
    expect(savedSettings).toMatchObject({
      settings: expect.arrayContaining([{ name: 'example_playback_day', value: 'friday' }]),
    });
    await setting.getByRole('button', { name: 'Playback Day (Example)' }).click();
    await expect(setting.getByRole('radio', { name: 'Friday', exact: true })).toBeChecked();
  });

  test('success banner – BannerMessage success', async ({ page }) => {
    await mockSettingsApis(page);
    await page.route('**/api/v1/settings/bulk', (route) => route.fulfill({ json: {} }));
    await page.goto('/settings/main');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.alert-success')).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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
