import type { Page } from '@playwright/test';

export async function mockDate(page: Page, isoDate: string) {
  const fakeNow = new Date(isoDate).getTime();
  await page.addInitScript(`{
    const _fakeNow = ${fakeNow};
    const _OriginalDate = Date;
    class _MockDate extends _OriginalDate {
      constructor(...args) {
        if (args.length === 0) { super(_fakeNow); } else { super(...args); }
      }
      static now() { return _fakeNow; }
    }
    _MockDate.parse = _OriginalDate.parse;
    _MockDate.UTC   = _OriginalDate.UTC;
    globalThis.Date = _MockDate;
  }`);
}

export async function stallAllApis(page: Page) {
  await page.route('**/api/**', async (route) => {
    // Keep request pending until the page closes (webkit requires a clean abort on teardown)
    await new Promise<void>((resolve) => page.once('close', () => resolve()));
    await route.abort().catch(() => {});
  });
}
