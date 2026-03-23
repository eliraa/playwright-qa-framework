import { expect, type Locator, type Page } from '@playwright/test';

export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export class AdminUsersFilterComponent {
  readonly form: Locator;
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    const adminForm = page.locator('form').first();
    const visibleFilterInputs = adminForm.locator('input:not([type="hidden"])');
    const filterDropdowns = adminForm.locator('.oxd-select-text');

    this.form = adminForm;
    this.usernameInput = visibleFilterInputs.nth(0);
    this.userRoleDropdown = filterDropdowns.nth(0);
    this.statusDropdown = filterDropdowns.nth(1);
    this.searchButton = adminForm.locator('button[type="submit"]').first();
    this.resetButton = adminForm.locator('button[type="button"]').first();
  }

  async expectReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  async setUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async selectUserRole(role: UserRole): Promise<void> {
    await this.userRoleDropdown.click();
    await this.page.getByRole('option', { name: role }).click();
    await expect(this.userRoleDropdown).toContainText(role);
  }

  async selectStatus(status: UserStatus): Promise<void> {
    await this.statusDropdown.click();
    await this.page.getByRole('option', { name: status }).click();
    await expect(this.statusDropdown).toContainText(status);
  }

  async submitSearch(): Promise<void> {
    await this.searchButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  async expectReset(): Promise<void> {
    await expect(this.usernameInput).toHaveValue('');
  }
}
