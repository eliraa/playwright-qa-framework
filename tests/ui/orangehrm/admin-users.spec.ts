import { AdminPage } from '../../../src/pages/orangehrm/admin.page';
import { test } from '../../../src/fixtures/auth.fixture';

test.describe('OrangeHRM admin users', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(({ browserName }) => browserName !== 'chromium', 'OrangeHRM coverage is stabilized in Chromium first.');

  test('searches for the Admin user in the users table', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();
    });

    await test.step('Search for the Admin user', async () => {
      await adminPage.searchUserByUsername('Admin');
    });

    await test.step('Verify the Admin user appears in the results', async () => {
      await adminPage.expectUserVisible('Admin');
      await adminPage.expectResultsToContain('Admin');
    });
  });

  test('filters the users table by Admin role', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();
    });

    await test.step('Search for Admin users by role', async () => {
      await adminPage.searchByUserRole('Admin');
    });

    await test.step('Verify the results are all Admin users', async () => {
      await adminPage.expectResultsCompatibleWithRole('Admin');
      await adminPage.expectResultsToContain('Admin');
    });
  });

  test('does not show a row for a random username', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);
    const randomUsername = `no-user-${Date.now()}`;

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();
    });

    await test.step('Search for a username that should not exist', async () => {
      await adminPage.searchUserByUsername(randomUsername);
    });

    await test.step('Verify no matching user is returned', async () => {
      await adminPage.expectNoResultsFor(randomUsername);
    });
  });

  test('combines username and role filters for the Admin user', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await test.step('Open the Admin users page', async () => {
      await adminPage.open();
    });

    await test.step('Search for the Admin user with the Admin role filter', async () => {
      await adminPage.searchByUsernameAndRole('Admin', 'Admin');
    });

    await test.step('Verify the filtered results still contain the Admin user', async () => {
      await adminPage.expectUserVisible('Admin');
      await adminPage.expectResultsCompatibleWithRole('Admin');
      await adminPage.expectResultsToContain('Admin');
    });
  });
});
