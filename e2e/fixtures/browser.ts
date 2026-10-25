import type { Page } from '@playwright/test';

export const BROWSER_FILES = {
  feedId: null,
  subFiles: [
    { name: 'track-01.mp3', actualPath: '/music/track-01.mp3' },
    { name: 'track-02.mp3', actualPath: '/music/track-02.mp3' },
  ],
  yearView: false,
  lastPath: null,
  breadcrumbs: [
    { name: 'Root', path: '' },
    { name: 'Music', path: '/music' },
  ],
  currentFile: null,
  years: [],
  currentYear: 2024,
};

export const BROWSER_YEAR = {
  feedId: null,
  subFiles: [
    { name: '2024-01-15', actualPath: '/music/2024/01/15' },
    { name: '2024-03-22', actualPath: '/music/2024/03/22' },
  ],
  yearView: true,
  lastPath: null,
  breadcrumbs: [{ name: 'Root', path: '' }],
  currentFile: null,
  years: [
    { year: 2023, actualPath: '/music/2023' },
    { year: 2024, actualPath: '/music/2024' },
  ],
  currentYear: 2024,
};

export async function mockBrowserApis(page: Page, yearView = false) {
  await page.route('**/api/v1/browser-items**', (route) =>
    route.fulfill({ json: yearView ? BROWSER_YEAR : BROWSER_FILES })
  );
  await page.route('**/api/v1/shortcut**', (route) => route.fulfill({ json: [] }));
}
