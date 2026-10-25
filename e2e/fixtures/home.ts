import type { Page } from '@playwright/test';

const EXAMPLE_LOGOS: Record<string, string> = {
  'FlagA.png': new URL('../../example-images/FlagA.png', import.meta.url).pathname,
  'FlagB.png': new URL('../../example-images/FlagB.png', import.meta.url).pathname,
  'FlagC.png': new URL('../../example-images/FlagC.png', import.meta.url).pathname,
  'Tiger.png': new URL('../../example-images/Tiger.png', import.meta.url).pathname,
};

export const SHORTCUTS = [
  { id: '1', feedName: 'jazz', title: 'Jazz', logoPath: '', count: 3, sessionId: '' },
  { id: '2', feedName: 'classical', title: 'Classical', logoPath: '', count: 0, sessionId: '' },
];

export const ICON_SHORTCUTS = [
  { id: '1', feedName: 'jazz', title: 'Jazz', logoPath: 'FlagA.png', count: 3, sessionId: '' },
  {
    id: '2',
    feedName: 'classical',
    title: 'Classical',
    logoPath: 'FlagC.png',
    count: 0,
    sessionId: '',
  },
  { id: '3', feedName: 'rock', title: 'Rock', logoPath: 'FlagB.png', count: 5, sessionId: '' },
  { id: '4', feedName: 'blues', title: 'Blues', logoPath: '', count: 7, sessionId: '' },
  { id: '5', feedName: 'electronic', title: 'Electronic', logoPath: '', count: 2, sessionId: '' },
  { id: '6', feedName: 'ambient', title: 'Ambient', logoPath: '', count: 4, sessionId: '' },
  { id: '7', feedName: 'funk', title: 'Funk', logoPath: '', count: 6, sessionId: '' },
  { id: '8', feedName: 'soul', title: 'Soul', logoPath: '', count: 1, sessionId: '' },
  { id: '9', feedName: 'reggae', title: 'Reggae', logoPath: '', count: 8, sessionId: '' },
  { id: '10', feedName: 'country', title: 'Country', logoPath: '', count: 3, sessionId: '' },
  { id: '11', feedName: 'folk', title: 'Folk', logoPath: '', count: 5, sessionId: '' },
  { id: '12', feedName: 'disco', title: 'Disco', logoPath: '', count: 2, sessionId: '' },
  { id: '13', feedName: 'metal', title: 'Metal', logoPath: '', count: 9, sessionId: '' },
  { id: '14', feedName: 'hip-hop', title: 'Hip-Hop', logoPath: '', count: 4, sessionId: '' },
  { id: '15', feedName: 'world', title: 'World', logoPath: '', count: 1, sessionId: '' },
  {
    id: '16',
    feedName: 'soundtracks',
    title: 'Soundtracks',
    logoPath: '',
    count: 7,
    sessionId: '',
  },
];

export async function mockHomeListApis(page: Page) {
  await page.route('**/api/v1/settings/logo_view', (route) =>
    route.fulfill({ json: { booleanValue: false, name: 'logo_view', value: false } })
  );
  await page.route('**/api/v1/shortcut**', (route) => route.fulfill({ json: SHORTCUTS }));
  await page.route('**/api/v1/commit-time', (route) =>
    route.fulfill({ json: { commitTime: '2024-01-01T00:00:00Z' } })
  );
}

export async function mockHomeIconApis(page: Page) {
  await page.route('**/exclude/logos/**', (route) => {
    const filename = route.request().url().split('/').pop() ?? '';
    const logo = EXAMPLE_LOGOS[filename];
    if (!logo) {
      return route.abort();
    }
    return filename.endsWith('.png')
      ? route.fulfill({ path: logo })
      : route.fulfill({ contentType: 'image/svg+xml', body: logo });
  });
  await page.route('**/api/v1/settings/logo_view', (route) =>
    route.fulfill({ json: { booleanValue: true, name: 'logo_view', value: true } })
  );
  await page.route('**/api/v1/shortcut**', (route) => route.fulfill({ json: ICON_SHORTCUTS }));
  await page.route('**/api/v1/commit-time', (route) =>
    route.fulfill({ json: { commitTime: '2024-01-01T00:00:00Z' } })
  );
}
