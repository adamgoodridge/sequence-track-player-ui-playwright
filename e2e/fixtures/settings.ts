import type { Page } from '@playwright/test';

export const SETTING_FIELDS = [
  {
    name: 'example_playback_day',
    displayName: 'Playback Day (Example)',
    formType: 'TEXT',
    value: 'monday',
    options: [
      { value: 'monday', displayName: 'Monday' },
      { value: 'tuesday', displayName: 'Tuesday' },
      { value: 'wednesday', displayName: 'Wednesday' },
      { value: 'thursday', displayName: 'Thursday' },
      { value: 'friday', displayName: 'Friday' },
      { value: 'saturday', displayName: 'Saturday' },
      { value: 'sunday', displayName: 'Sunday' },
    ],
  },
  {
    name: 'logo_view',
    displayName: 'Logo View',
    formType: 'TEXT',
    value: 'false',
    options: [
      { value: 'true', displayName: 'Enabled' },
      { value: 'false', displayName: 'Disabled' },
    ],
  },
  {
    name: 'is_scanning',
    displayName: 'Shuffle',
    formType: 'TEXT',
    value: 'false',
    options: [
      { value: 'true', displayName: 'On' },
      { value: 'false', displayName: 'Off' },
    ],
  },
];

export async function mockSettingsApis(page: Page) {
  await page.route('**/api/v1/settings/form', (route) => route.fulfill({ json: SETTING_FIELDS }));
}
