import type { Page } from '@playwright/test';
import { mockDate } from './shared';

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

export async function mockStatsApis(page: Page) {
  await mockDate(page, '2026-10-18');
  await page.route('**/api/v1/statistic/summary/week**', (route) => route.fulfill({ json: STATS }));
}
