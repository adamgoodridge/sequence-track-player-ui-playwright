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
  const responses: [string, unknown][] = [
    [`feed/ownership/${feedId}`, { sessionId: FEED.sessionId }],
    [`feed/status/${feedId}**`, { sessionId: FEED.sessionId, isLoaded: false }],
    ...['current', 'next'].map((action): [string, unknown] => [
      `feed/get/${action}/${feedId}**`,
      FEED,
    ]),
    ...['regularly_change_to_random', 'is_scanning'].map((name): [string, unknown] => [
      `settings/${name}`,
      { booleanValue: false, name, value: false },
    ]),
  ];
  for (const [endpoint, json] of responses) {
    await page.route(`**/api/v1/${endpoint}`, (route) => route.fulfill({ json }));
  }
}
