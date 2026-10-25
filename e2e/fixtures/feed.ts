import type { Page } from '@playwright/test';

export const FEED = {
  feedId: 42,
  name: 'Jazz',
  trackName: 'Blue Rondo à la Turk',
  logoPath: '',
  count: 5,
  trackUrl: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
  sessionId: 'session-abc',
  trackCurrentCount: 2,
  bookmarkId: '-1',
  currentPosition: 0,
};

export async function mockFeedApis(page: Page, feedId = 42) {
  await page.route(`**/api/v1/feed/ownership/${feedId}`, (route) =>
    route.fulfill({ json: { sessionId: 'session-abc' } })
  );
  await page.route(`**/api/v1/feed/status/${feedId}**`, (route) =>
    route.fulfill({ json: { sessionId: 'session-abc', isLoaded: false } })
  );
  await page.route(`**/api/v1/feed/get/current/${feedId}**`, (route) =>
    route.fulfill({ json: FEED })
  );
  await page.route(`**/api/v1/feed/get/next/${feedId}**`, (route) => route.fulfill({ json: FEED }));
  await page.route('**/api/v1/settings/regularly_change_to_random', (route) =>
    route.fulfill({
      json: { booleanValue: false, name: 'regularly_change_to_random', value: false },
    })
  );
  await page.route('**/api/v1/settings/is_scanning', (route) =>
    route.fulfill({ json: { booleanValue: false, name: 'is_scanning', value: false } })
  );
}
