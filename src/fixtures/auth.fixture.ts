import { test as base, type Page } from '@playwright/test';
import { orangeHrmUsers } from '../data/users/orangehrm.users';
import { DashboardPage } from '../pages/orangehrm/dashboard.page';
import { LoginPage } from '../pages/orangehrm/login.page';

type AuthFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.open();
    await loginPage.login(
      orangeHrmUsers.valid.username,
      orangeHrmUsers.valid.password,
    );
    await dashboardPage.expectLoaded();

    await use(page);
  },
});
export { expect } from '@playwright/test';
