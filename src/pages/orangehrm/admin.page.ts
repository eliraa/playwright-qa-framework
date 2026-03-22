import type { Locator, Page } from '@playwright/test';

export class AdminPage {
  readonly adminNavLink: Locator;
  readonly adminHeader: Locator;
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly searchButton: Locator;
  readonly usersTable: Locator;
  readonly userRows: Locator;
  readonly adminUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.adminNavLink = page.getByRole('link', { name: 'Admin' });
    this.adminHeader = page.getByRole('heading', { name: 'Admin' });
    this.usernameInput = page
      .locator('.oxd-input-group', { hasText: 'Username' })
      .locator('input')
      .first();
    this.userRoleDropdown = page
      .locator('.oxd-input-group', { hasText: 'User Role' })
      .locator('.oxd-select-text')
      .first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.usersTable = page.locator('.oxd-table-body').first();
    this.userRows = page.locator('.oxd-table-card');
    this.adminUrlPattern = /\/web\/index\.php\/admin\/viewSystemUsers/;
  }

  async open(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(this.adminUrlPattern),
      this.adminNavLink.click(),
    ]);
  }

  async selectUserRole(role: 'Admin' | 'ESS'): Promise<void> {
    await this.userRoleDropdown.click();
    await this.page.getByRole('option', { name: role }).click();
  }

  async searchUserByUsername(
    username: string,
    role?: 'Admin' | 'ESS',
  ): Promise<void> {
    await this.usernameInput.fill(username);

    if (role) {
      await this.selectUserRole(role);
    }

    await this.searchButton.click();
  }

  userRow(username: string): Locator {
    return this.userRows.filter({ hasText: username }).first();
  }
}
