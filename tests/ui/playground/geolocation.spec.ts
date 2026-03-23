import { expect, test, type Browser, type BrowserContextOptions } from '@playwright/test';
import { PlaygroundPageManager } from '../../../src/pages/playground/playground.page-manager';

const sofiaCoordinates = {
  latitude: 42.6977,
  longitude: 23.3219,
};

async function openGeolocationPage(
  browser: Browser,
  contextOptions: BrowserContextOptions = {},
): Promise<{
  close: () => Promise<void>;
  playground: PlaygroundPageManager;
}> {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    ...contextOptions,
  });
  const page = await context.newPage();
  const playground = new PlaygroundPageManager(page);

  await playground.geolocation.open();

  return {
    close: async () => context.close(),
    playground,
  };
}

test.describe('Geolocation', () => {
  test('shows the mocked coordinates when geolocation permission is allowed', async ({ browser }) => {
    const session = await openGeolocationPage(browser, {
      permissions: ['geolocation'],
      geolocation: sofiaCoordinates,
    });

    try {
      await expect(session.playground.geolocation.locationValue).toHaveText('Not requested');

      await session.playground.geolocation.requestLocationButton.click();

      await expect(session.playground.geolocation.locationValue).toHaveText('42.697700, 23.321900');
    } finally {
      await session.close();
    }
  });

  test('shows unavailable when geolocation permission is not granted', async ({ browser, browserName }) => {
    test.skip(
      browserName === 'firefox',
      'Firefox leaves this demo in "Requesting..." because geolocation stays in browser prompt state instead of resolving to a denied callback.',
    );

    const session = await openGeolocationPage(browser);

    try {
      await expect(session.playground.geolocation.locationValue).toHaveText('Not requested');

      await session.playground.geolocation.requestLocationButton.click();

      await expect(session.playground.geolocation.locationValue).toHaveText('unavailable');
    } finally {
      await session.close();
    }
  });
});
