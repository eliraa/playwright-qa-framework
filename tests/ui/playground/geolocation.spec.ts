import { expect, test, type Browser, type BrowserContextOptions } from '@playwright/test';
import { GeolocationPage } from '../../../src/pages/playground/element-interaction.page';

const sofiaCoordinates = {
  latitude: 42.6977,
  longitude: 23.3219,
};

async function openGeolocationPage(
  browser: Browser,
  contextOptions: BrowserContextOptions = {},
): Promise<{
  close: () => Promise<void>;
  geolocationPage: GeolocationPage;
}> {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    ...contextOptions,
  });
  const page = await context.newPage();
  const geolocationPage = new GeolocationPage(page);

  await geolocationPage.open();

  return {
    close: async () => context.close(),
    geolocationPage,
  };
}

test.describe('Geolocation', () => {
  test('shows the mocked coordinates when geolocation permission is allowed', async ({ browser }) => {
    const session = await openGeolocationPage(browser, {
      permissions: ['geolocation'],
      geolocation: sofiaCoordinates,
    });

    try {
      await expect(session.geolocationPage.locationValue).toHaveText('Not requested');

      await session.geolocationPage.requestLocationButton.click();

      await expect(session.geolocationPage.locationValue).toHaveText('42.697700, 23.321900');
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
      await expect(session.geolocationPage.locationValue).toHaveText('Not requested');

      await session.geolocationPage.requestLocationButton.click();

      await expect(session.geolocationPage.locationValue).toHaveText('unavailable');
    } finally {
      await session.close();
    }
  });
});
