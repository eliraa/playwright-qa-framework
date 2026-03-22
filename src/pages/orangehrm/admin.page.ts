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
    const adminForm = page.locator('form').first();

    this.adminNavLink = page.locator('a[href*="/admin/viewAdminModule"]').first();
    this.adminHeader = page.locator('.oxd-topbar-header-breadcrumb h6').first();
    this.usernameInput = adminForm.locator('input:not([type="hidden"])').first();
    this.userRoleDropdown = adminForm.locator('.oxd-select-text').first();
    this.searchButton = adminForm.locator('button[type="submit"]').first();
    this.usersTable = page.locator('.oxd-table-body').first();
    this.userRows = page.locator('.oxd-table-card');
    this.adminUrlPattern = /\/web\/index\.php\/admin\/viewSystemUsers/;
  }

  async open(): Promise<void> {
    await this.adminNavLink.click();
    await this.page.waitForURL(this.adminUrlPattern);
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
    await this.page.waitForLoadState('networkidle');
  }

  userRow(username: string): Locator {
    return this.userRows.filter({ hasText: username }).first();
  }

  async isUserVisible(username: string): Promise<boolean> {
    return this.userRow(username).isVisible();
  }
}
