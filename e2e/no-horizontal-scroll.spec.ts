import { test, expect, type Page } from '@playwright/test';
import { mockHomeIconApis, mockHomeListApis, ICON_SHORTCUTS, SHORTCUTS } from './fixtures/home';
import { mockStatsApis, STATS } from './fixtures/stats';
import { mockBookmarksApis, BOOKMARKS } from './fixtures/bookmarks';
import { mockBrowserApis, BROWSER_FILES, BROWSER_YEAR } from './fixtures/browser';
import { mockCurrentFeedsApis, CURRENT_FEEDS } from './fixtures/current-feeds';
import { mockFeedApis, FEED } from './fixtures/feed';
import { mockSettingsApis, SETTING_FIELDS } from './fixtures/settings';
import { stallAllApis } from './fixtures/shared';

const longName = 'longdirectoryname'.repeat(20);

function withResponse(setup: (page: Page) => Promise<void>, endpoint: string, json: unknown) {
  return async (page: Page) => {
    await setup(page);
    await page.route(endpoint, (route) => route.fulfill({ json }));
  };
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const hostname = new URL(route.request().url()).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
});

async function expectNoHorizontalScroll(page: Page) {
  const viewport = page.viewportSize()!;
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(viewport.width);
  expect(widths.body).toBeLessThanOrEqual(viewport.width);
  const outsideViewport = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main *, nav *'))
      .filter((element) => {
        if (!(element instanceof HTMLElement) || element.getClientRects().length === 0) {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
      })
      .map((element) => `${element.tagName}.${element.className}`)
      .slice(0, 5)
  );
  expect(outsideViewport, 'content must fit, not be clipped offscreen').toEqual([]);
}

const cases: {
  name: string;
  url: string;
  mock: (page: Page) => Promise<void>;
  ready: string;
  testLoading?: boolean;
}[] = [
  {
    name: 'home grid',
    url: '/',
    mock: withResponse(
      mockHomeIconApis,
      '**/api/v1/shortcut**',
      ICON_SHORTCUTS.map((shortcut, index) =>
        index === 0 ? { ...shortcut, title: longName } : shortcut
      )
    ),
    ready: '.icon-grid-item',
    testLoading: true,
  },
  {
    name: 'home list with long names',
    url: '/home',
    mock: withResponse(mockHomeListApis, '**/api/v1/shortcut**', [
      { ...SHORTCUTS[0], title: longName },
    ]),
    ready: '.list-group-item',
  },
  {
    name: 'current feeds with long names',
    url: '/feed/list/current',
    mock: withResponse(mockCurrentFeedsApis, '**/api/v1/feed/current**', {
      ...CURRENT_FEEDS,
      sortByFeedResponse: [
        {
          feedName: longName,
          audioFeederItems: [
            {
              ...CURRENT_FEEDS.sortByFeedResponse[0].audioFeederItems[0],
              trackName: longName,
            },
          ],
        },
      ],
    }),
    ready: '.list-group-item',
    testLoading: true,
  },
  {
    name: 'feed with a long track name',
    url: '/feed/42',
    mock: withResponse(mockFeedApis, '**/api/v1/feed/get/current/42**', {
      ...FEED,
      trackName: longName,
    }),
    ready: '.rhap_container',
    testLoading: true,
  },
  {
    name: 'browser file list with long names',
    url: '/browser',
    mock: withResponse(mockBrowserApis, '**/api/v1/browser-items**', {
      ...BROWSER_FILES,
      breadcrumbs: [{ name: longName, path: '/music' }],
      subFiles: [{ name: `${longName}.mp3`, actualPath: `/music/${longName}.mp3` }],
    }),
    ready: 'nav[aria-label="breadcrumb"]',
    testLoading: true,
  },
  {
    name: 'feed browser',
    url: '/feed/42/browser',
    mock: withResponse(mockBrowserApis, '**/api/v1/feeds/42/browser-items**', BROWSER_FILES),
    ready: 'nav[aria-label="breadcrumb"]',
  },
  {
    name: 'browser calendar with many year buttons',
    url: '/browser',
    mock: withResponse((page) => mockBrowserApis(page, true), '**/api/v1/browser-items**', {
      ...BROWSER_YEAR,
      years: Array.from({ length: 15 }, (_, i) => ({
        year: 2010 + i,
        actualPath: `/music/${2010 + i}`,
      })),
    }),
    ready: '.calendar .month-container',
  },
  {
    name: 'bookmarks with long paths',
    url: '/bookmark/list',
    mock: withResponse(mockBookmarksApis, '**/api/v1/bookmark', [
      { ...BOOKMARKS[0], path: `/music/${longName}/track.mp3` },
    ]),
    ready: '.list-group-item',
    testLoading: true,
  },
  {
    name: 'settings with long labels',
    url: '/settings/main',
    mock: withResponse(mockSettingsApis, '**/api/v1/settings/form', [
      {
        ...SETTING_FIELDS[0],
        displayName: longName,
        options: [{ value: 'monday', displayName: longName }],
      },
    ]),
    ready: 'form',
    testLoading: true,
  },
  {
    name: 'stats with long feed names',
    url: '/stats',
    mock: withResponse(mockStatsApis, '**/api/v1/statistic/summary/week**', {
      ...STATS,
      feedCounts: [{ feedName: longName, count: 5 }],
    }),
    ready: '.pie-chart-shell',
    testLoading: true,
  },
  { name: 'menu', url: '/menu', mock: async () => {}, ready: '.iphone-app-grid' },
  {
    name: 'random feed loading',
    url: `/feed/get/random/${longName}`,
    mock: stallAllApis,
    ready: '.spinner-border',
  },
  { name: 'not found', url: '/missing-page', mock: async () => {}, ready: '[role="alert"]' },
  {
    name: 'error with long message',
    url: '/browser',
    mock: withResponse(mockBrowserApis, '**/api/v1/browser-items**', longName),
    ready: '.alert-danger',
  },
  {
    name: 'invalid feed ID',
    url: '/feed/not-a-number',
    mock: async () => {},
    ready: '[role="alert"]',
  },
  {
    name: 'missing random feed name',
    url: '/feed/get/random/',
    mock: async () => {},
    ready: '[role="alert"]',
  },
];

for (const scenario of cases.filter((scenario) => scenario.testLoading)) {
  cases.push({
    name: `${scenario.name} loading`,
    url: scenario.url,
    mock: stallAllApis,
    ready: '.spinner-border',
  });
}

test('shortcut grid fits its content area with page gutters', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 740 });
  await mockHomeIconApis(page);
  await page.goto('/');
  await expect(page.locator('.icon-grid-item')).toHaveCount(16);
  await page.addStyleTag({ content: 'main { padding-inline: 12px; }' });
  const bounds = await page.locator('.icon-grid').evaluate((grid) => ({
    grid: grid.getBoundingClientRect().width,
    parent: grid.parentElement!.getBoundingClientRect().width,
  }));
  expect(bounds.grid).toBeLessThanOrEqual(bounds.parent);
  await expectNoHorizontalScroll(page);
});

for (const width of [320, 768, 1280]) {
  for (const scenario of cases) {
    test(`${scenario.name} has no horizontal scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await scenario.mock(page);
      await page.goto(scenario.url, { waitUntil: 'domcontentloaded' });
      for (const viewportWidth of [width, 375]) {
        await page.setViewportSize({ width: viewportWidth, height: 740 });
        await expect(page.locator(scenario.ready).first()).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expectNoHorizontalScroll(page);
      }
    });
  }
}

test('resizing the chart and viewport keeps the entire chart inside its column', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 740 });
  await mockStatsApis(page);
  await page.goto('/stats');
  const shell = page.locator('.pie-chart-shell');
  await expect(shell).toBeVisible();
  const handle = await page.locator('.pie-chart-resize-handle').boundingBox();
  expect(handle).not.toBeNull();
  await page.mouse.move(handle!.x + handle!.width / 2, handle!.y + handle!.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 500, handle!.y + 500);
  await page.mouse.up();

  for (const width of [1280, 320, 768]) {
    await page.setViewportSize({ width, height: 740 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const shell = document.querySelector('.pie-chart-shell')!.getBoundingClientRect();
          const root = document.querySelector('.pie-chart-root')!.getBoundingClientRect();
          const ring = document.querySelector('.pie-chart-ring-wrap')!.getBoundingClientRect();
          return (
            shell.width <= root.width &&
            shell.left >= root.left &&
            shell.right <= root.right &&
            ring.left >= shell.left &&
            ring.right <= shell.right
          );
        })
      )
      .toBe(true);
    await expectNoHorizontalScroll(page);
  }
});
