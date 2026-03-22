import { AdminPage } from '../../../src/pages/orangehrm/admin.page';
import { expect, test } from '../../../src/fixtures/auth.fixture';

test.describe('OrangeHRM admin users', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'OrangeHRM coverage is stabilized in Chromium first.');

  test('searches for the Admin user in the users table', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();

      await expect(loggedInPage).toHaveURL(adminPage.adminUrlPattern);
      await expect(adminPage.adminHeader).toBeVisible();
      await expect(adminPage.usernameInput).toBeVisible();
    });

    await test.step('Search for the Admin user', async () => {
      await adminPage.searchUserByUsername('Admin');
    });

    await test.step('Verify the Admin user is shown in the results table', async () => {
      await expect(adminPage.usersTable).toBeVisible();
      await expect(adminPage.userRow('Admin')).toBeVisible();
      await expect(adminPage.usersTable).toContainText('Admin');
    });
  });

  test('does not show a row for a random username', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);
    const randomUsername = `no-user-${Date.now()}`;

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();

      await expect(loggedInPage).toHaveURL(adminPage.adminUrlPattern);
      await expect(adminPage.adminHeader).toBeVisible();
      await expect(adminPage.usernameInput).toBeVisible();
    });

    await test.step('Search for a username that should not exist', async () => {
      await adminPage.searchUserByUsername(randomUsername);
    });

    await test.step('Verify the random username is not shown in the results', async () => {
      await expect(adminPage.userRow(randomUsername)).not.toBeVisible();

      if (await adminPage.usersTable.isVisible()) {
        await expect(adminPage.usersTable).not.toContainText(randomUsername);
      }

      await expect
        .poll(async () => adminPage.isUserVisible(randomUsername))
        .toBe(false);
    });
  });
});
