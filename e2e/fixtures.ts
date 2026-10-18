import type { Page } from '@playwright/test';

export const SHORTCUTS = [
  { id: '1', feedName: 'jazz', title: 'Jazz', logoPath: '', count: 3, sessionId: '' },
  { id: '2', feedName: 'classical', title: 'Classical', logoPath: '', count: 0, sessionId: '' },
];

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

export const SETTING_FIELDS = [
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

export const CURRENT_FEEDS = {
  count: 2,
  sortByFeedResponse: [
    {
      feedName: 'Jazz',
      audioFeederItems: [
        { feedId: 1, trackName: 'Blue Rondo', includeInFullScreenShuffle: true, isIncludeInFullScreenShuffle: true, text: '' },
        { feedId: 1, trackName: 'Take Five', includeInFullScreenShuffle: true, isIncludeInFullScreenShuffle: true, text: '' },
      ],
    },
    {
      feedName: 'Classical',
      audioFeederItems: [],
    },
  ],
};

export const STATS = {
  length: 7,
  feedCounts: [
    { feedName: 'Jazz', count: 5 },
    { feedName: 'Classical', count: 2 },
  ],
  weekSummaries: [
    { name: 'Mon', totalLength: 3600, percentage: 30, feedStats: [] },
    { name: 'Tue', totalLength: 5400, percentage: 45, feedStats: [] },
    { name: 'Wed', totalLength: 3000, percentage: 25, feedStats: [] },
  ],
  totalLength: '3h 20m',
};

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

export const BOOKMARKS = [
  { bookmarkId: 'bm-1', path: '/music/jazz', feedName: 'Jazz' },
  { bookmarkId: 'bm-2', path: '/music/classical', feedName: 'Classical' },
];

// ── Route helpers ──────────────────────────────────────────────────────────────

export async function mockHomeListApis(page: Page) {
  await page.route('**/api/v1/settings/logo_view', (route) =>
    route.fulfill({ json: { booleanValue: false, name: 'logo_view', value: false } })
  );
  await page.route('**/api/v1/shortcut**', (route) =>
    route.fulfill({ json: SHORTCUTS })
  );
  await page.route('**/api/v1/commit-time', (route) =>
    route.fulfill({ json: { commitTime: '2024-01-01T00:00:00Z' } })
  );
}

export async function mockHomeIconApis(page: Page) {
  await page.route('**/api/v1/settings/logo_view', (route) =>
    route.fulfill({ json: { booleanValue: true, name: 'logo_view', value: true } })
  );
  await page.route('**/api/v1/shortcut**', (route) =>
    route.fulfill({ json: SHORTCUTS })
  );
  await page.route('**/api/v1/commit-time', (route) =>
    route.fulfill({ json: { commitTime: '2024-01-01T00:00:00Z' } })
  );
}

export async function mockSettingsApis(page: Page) {
  await page.route('**/api/v1/settings/form', (route) =>
    route.fulfill({ json: SETTING_FIELDS })
  );
}

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
  await page.route(`**/api/v1/feed/get/next/${feedId}**`, (route) =>
    route.fulfill({ json: FEED })
  );
  await page.route('**/api/v1/settings/regularly_change_to_random', (route) =>
    route.fulfill({ json: { booleanValue: false, name: 'regularly_change_to_random', value: false } })
  );
  await page.route('**/api/v1/settings/is_scanning', (route) =>
    route.fulfill({ json: { booleanValue: false, name: 'is_scanning', value: false } })
  );
}

export async function mockCurrentFeedsApis(page: Page) {
  await page.route('**/api/v1/feed/current**', (route) =>
    route.fulfill({ json: CURRENT_FEEDS })
  );
}

export async function mockStatsApis(page: Page) {
  await page.route('**/api/v1/statistic/summary/week**', (route) =>
    route.fulfill({ json: STATS })
  );
}

export async function mockBrowserApis(page: Page, yearView = false) {
  await page.route('**/api/v1/browser-items**', (route) =>
    route.fulfill({ json: yearView ? BROWSER_YEAR : BROWSER_FILES })
  );
  await page.route('**/api/v1/shortcut**', (route) =>
    route.fulfill({ json: [] })
  );
}

export async function mockBookmarksApis(page: Page) {
  await page.route('**/api/v1/bookmark', (route) =>
    route.fulfill({ json: BOOKMARKS })
  );
}

export async function stallAllApis(page: Page) {
  await page.route('**/api/**', async (route) => {
    // Keep request pending until the page closes (webkit requires a clean abort on teardown)
    await new Promise<void>((resolve) => page.once('close', resolve));
    await route.abort().catch(() => {});
  });
}
