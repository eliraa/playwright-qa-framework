import type { Page } from '@playwright/test';
import { orangeHrmUsers } from '../../data/orangehrm/users';
import { DashboardPage } from '../../pages/orangehrm/dashboard.page';
import { LoginPage } from '../../pages/orangehrm/login.page';
import {
  describeOrangeHrmDebugError,
  logOrangeHrmDebug,
} from '../../support/orangehrm/live-debug';
import { expect, test as base } from './live.fixture';

type AuthFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page, orangeHrmDebugSession: _orangeHrmDebugSession }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    logOrangeHrmDebug(page, 'Starting OrangeHRM auth fixture');

    try {
      await loginPage.open();
      await loginPage.login(
        orangeHrmUsers.valid.username,
        orangeHrmUsers.valid.password,
      );
      logOrangeHrmDebug(page, 'Submitted OrangeHRM login credentials', {
        username: orangeHrmUsers.valid.username,
      });
      // Reuse the same post-login readiness contract as the specs so setup and assertions
      // do not drift over time.
      await dashboardPage.expectLoaded();
      logOrangeHrmDebug(page, 'OrangeHRM auth fixture reached the dashboard', {
        currentUrl: page.url(),
      });

      await use(page);
    } catch (error) {
      logOrangeHrmDebug(page, 'OrangeHRM auth fixture failed', {
        currentUrl: page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }
  },
});
export { expect } from './live.fixture';
