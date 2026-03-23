import { expect, test } from '@playwright/test';
import { orangeHrmUsers } from '../../../src/data/orangehrm/users';
import { DashboardPage } from '../../../src/pages/orangehrm/dashboard.page';
import { LoginPage } from '../../../src/pages/orangehrm/login.page';
import { ORANGE_HRM_UI_TIMEOUT } from '../../../src/pages/orangehrm/orangehrm.constants';

test.describe('OrangeHRM login', () => {
  test('signs in successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await test.step('Open the OrangeHRM login page', async () => {
      await loginPage.open();
    });

    await test.step('Submit valid OrangeHRM credentials', async () => {
      await loginPage.login(
        orangeHrmUsers.valid.username,
        orangeHrmUsers.valid.password,
      );
    });

    await test.step('Verify the user lands on the dashboard', async () => {
      await dashboardPage.expectLoaded();
    });
  });

  test('shows an error message for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Open the OrangeHRM login page', async () => {
      await loginPage.open();
    });

    await test.step('Submit invalid OrangeHRM credentials', async () => {
      await loginPage.login(
        orangeHrmUsers.invalid.username,
        orangeHrmUsers.invalid.password,
      );
    });

    await test.step('Verify the invalid credentials message is shown', async () => {
      await expect(loginPage.invalidCredentialsAlert).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
      await expect(loginPage.invalidCredentialsMessage).toContainText('Invalid credentials');
    });
  });
});
