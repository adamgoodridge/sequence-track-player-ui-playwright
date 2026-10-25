import type { Page } from '@playwright/test';

export const BOOKMARKS = [
  { bookmarkId: 'bm-1', path: '/music/jazz', feedName: 'Jazz' },
  { bookmarkId: 'bm-2', path: '/music/classical', feedName: 'Classical' },
];

export async function mockBookmarksApis(page: Page) {
  await page.route('**/api/v1/bookmark', (route) => route.fulfill({ json: BOOKMARKS }));
}
