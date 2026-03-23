import { DashboardPage } from '../../../src/pages/orangehrm/dashboard.page';
import { expect, test } from '../../../src/fixtures/auth.fixture';

test.describe('OrangeHRM dashboard', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'OrangeHRM coverage is stabilized in Chromium first.');

  test('opens the dashboard for an authenticated user', async ({ loggedInPage }) => {
    const dashboardPage = new DashboardPage(loggedInPage);

    await test.step('Open the OrangeHRM dashboard', async () => {
      await dashboardPage.open();
    });

    await test.step('Verify the authenticated dashboard is visible', async () => {
      await dashboardPage.expectLoaded();
    });
  });
});
