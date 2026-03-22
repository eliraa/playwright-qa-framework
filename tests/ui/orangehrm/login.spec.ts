import { expect, test } from '@playwright/test';
import { orangeHrmUsers } from '../../../src/data/users/orangehrm.users';
import { DashboardPage } from '../../../src/pages/orangehrm/dashboard.page';
import { LoginPage } from '../../../src/pages/orangehrm/login.page';

test.describe('OrangeHRM login', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'OrangeHRM coverage is stabilized in Chromium first.');

  test('signs in successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await test.step('Open the OrangeHRM login page', async () => {
      await loginPage.open();

      await expect(loginPage.loginButton).toBeVisible();
    });

    await test.step('Submit valid OrangeHRM credentials', async () => {
      await loginPage.login(
        orangeHrmUsers.valid.username,
        orangeHrmUsers.valid.password,
      );
    });

    await test.step('Verify the user lands on the dashboard', async () => {
      await expect(page).toHaveURL(dashboardPage.dashboardUrlPattern);
      await expect(dashboardPage.dashboardHeader).toBeVisible();
    });
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the OrangeHRM login page', async () => {
      await loginPage.open();

      await expect(loginPage.loginButton).toBeVisible();
    });

    await test.step('Submit invalid OrangeHRM credentials', async () => {
      await loginPage.login(
        orangeHrmUsers.invalid.username,
        orangeHrmUsers.invalid.password,
      );
    });

    await test.step('Verify the invalid credentials message is shown', async () => {
      await expect(loginPage.invalidCredentialsMessage).toBeVisible();
      await expect(loginPage.invalidCredentialsMessage).toContainText('Invalid credentials');
    });
  });
});
