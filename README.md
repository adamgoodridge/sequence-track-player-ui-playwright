# stp-ui-snapshots

Playwright end-to-end tests and visual snapshot baselines for [`sequence-track-player-ui`](https://git.adsmac.net/adsmac/docker/-/tree/main/sequence-track-player-ui).

This repo is consumed as a git submodule. Test specs live in `e2e/` alongside their snapshot directories (`*.spec.ts-snapshots/`). Keeping snapshots here prevents large PNG files from bloating the main UI repo history.

## Structure

```
e2e/
  fixtures.ts                        # Shared Playwright fixtures
  home.spec.ts
  feed.spec.ts
  feed-loading.spec.ts
  browser.spec.ts
  bookmarks.spec.ts
  menu.spec.ts
  settings.spec.ts
  stats.spec.ts
  not-found.spec.ts
  *.spec.ts-snapshots/               # PNG baselines per spec, browser, and platform
```

Snapshot filenames follow the pattern `<description>-<browser>-<platform>.png`, e.g. `settings-loaded-chromium-darwin.png`.

## Running tests

Tests are run from the **parent** `sequence-track-player-ui` directory, not from here. The `playwright.config.ts` in that repo points `testDir` at this submodule.

```bash
# from sequence-track-player-ui/
npm run test:e2e          # run all E2E tests
npm run test:e2e:ui       # interactive Playwright UI
npm run test:e2e:report   # open last HTML report
```

The dev server (`https://localhost:8443`) must be reachable. The Playwright config will start it automatically when not already running.

## Updating snapshots

When a UI change intentionally alters visuals, regenerate the baselines:

```bash
# from sequence-track-player-ui/
npx playwright test --update-snapshots
```

Then commit the new PNGs here and advance the submodule pointer in the parent:

```bash
# 1. commit updated snapshots in this repo
cd stp-ui-snapshots
git add e2e/
git commit -m "update visual baselines for <change description>"
git push

# 2. advance the submodule pointer in the parent repo
cd ..
git add stp-ui-snapshots
git commit -m "update stp-ui-snapshots ref"
```

## Pulling snapshot updates from others

```bash
# from sequence-track-player-ui/
git submodule update --remote stp-ui-snapshots
```

## First-time setup

If you cloned the parent `docker` repo without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```
