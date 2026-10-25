import type { Page } from '@playwright/test';

export const CURRENT_FEEDS = {
  count: 2,
  sortByFeedResponse: [
    {
      feedName: 'Jazz',
      audioFeederItems: [
        {
          feedId: 1,
          trackName: 'Blue Rondo',
          includeInFullScreenShuffle: true,
          isIncludeInFullScreenShuffle: true,
          text: '',
        },
        {
          feedId: 1,
          trackName: 'Take Five',
          includeInFullScreenShuffle: true,
          isIncludeInFullScreenShuffle: true,
          text: '',
        },
      ],
    },
    {
      feedName: 'Classical',
      audioFeederItems: [],
    },
  ],
};

export async function mockCurrentFeedsApis(page: Page) {
  await page.route('**/api/v1/feed/current**', (route) => route.fulfill({ json: CURRENT_FEEDS }));
}
