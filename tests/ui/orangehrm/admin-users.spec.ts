import type { Page } from '@playwright/test';
import { AdminPage } from '../../../src/pages/orangehrm/admin.page';
import { expect, test } from '../../../src/fixtures/auth.fixture';

test.describe('OrangeHRM admin users', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(({ browserName }) => browserName !== 'chromium', 'OrangeHRM coverage is stabilized in Chromium first.');

  test('searches for the Admin user in the users table', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await openAdminUsersPage(adminPage, loggedInPage);

    await test.step('Set the username filter', async () => {
      await adminPage.searchUserByUsername('Admin');
    });

    await test.step('Validate the Admin user is shown in the results table', async () => {
      const visibleRowsText = await adminPage.getVisibleRowsText();

      expect(visibleRowsText.length).toBeGreaterThan(0);
      expect(await adminPage.isUserVisible('Admin')).toBe(true);
      expect(visibleRowsText.join(' ')).toContain('Admin');
      await expect(adminPage.usersTable).toContainText('Admin');
    });
  });

  test('filters the users table by Admin role', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await openAdminUsersPage(adminPage, loggedInPage);

    await test.step('Set the user role filter', async () => {
      await adminPage.selectUserRole('Admin');
    });

    await test.step('Run the search', async () => {
      await adminPage.clickSearch();
    });

    await test.step('Validate the visible rows are compatible with the selected role', async () => {
      const visibleRowsText = await adminPage.getVisibleRowsText();

      expect(visibleRowsText.length).toBeGreaterThan(0);
      expect(visibleRowsText.join(' ')).toContain('Admin');
      await expect(adminPage.usersTable).toContainText('Admin');

      for (const rowText of visibleRowsText) {
        expect(rowText).not.toContain('ESS');
      }
    });
  });

  test('does not show a row for a random username', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);
    const randomUsername = `no-user-${Date.now()}`;

    await openAdminUsersPage(adminPage, loggedInPage);

    await test.step('Set the username filter', async () => {
      await adminPage.searchUserByUsername(randomUsername);
    });

    await test.step('Validate no matching row is shown in the results', async () => {
      const visibleRowsText = await adminPage.getVisibleRowsText();
      const hasNoRecordsMessage = await adminPage.noRecordsMessage.isVisible();
      const matchesRandomUsername = visibleRowsText.some((rowText) => rowText.includes(randomUsername));

      expect(await adminPage.isUserVisible(randomUsername)).toBe(false);
      expect(matchesRandomUsername).toBe(false);

      if (hasNoRecordsMessage) {
        await expect(adminPage.noRecordsMessage).toBeVisible();
      } else if (visibleRowsText.length > 0) {
        await expect(adminPage.usersTable).not.toContainText(randomUsername);
      }
    });
  });

  test('combines username and role filters for the Admin user', async ({ loggedInPage }) => {
    const adminPage = new AdminPage(loggedInPage);

    await openAdminUsersPage(adminPage, loggedInPage);

    await test.step('Set the username and role filters', async () => {
      await adminPage.usernameInput.fill('Admin');
      await adminPage.selectUserRole('Admin');
    });

    await test.step('Run the search', async () => {
      await adminPage.clickSearch();
    });

    await test.step('Validate the filtered results still contain the Admin user', async () => {
      const visibleRowsText = await adminPage.getVisibleRowsText();

      expect(visibleRowsText.length).toBeGreaterThan(0);
      expect(await adminPage.isUserVisible('Admin')).toBe(true);
      expect(visibleRowsText.join(' ')).toContain('Admin');
      await expect(adminPage.usersTable).toContainText('Admin');
    });
  });
});

async function openAdminUsersPage(adminPage: AdminPage, loggedInPage: Page): Promise<void> {
  await test.step('Navigate to the Admin users page', async () => {
    await adminPage.open();

    await expect(loggedInPage).toHaveURL(adminPage.adminUrlPattern);
    await expect(adminPage.adminHeader).toBeVisible();
    await expect(adminPage.usernameInput).toBeVisible();
    await expect(adminPage.usersTable).toBeVisible();
  });
}
