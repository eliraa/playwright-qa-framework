import { expect, type Locator, type Page } from '@playwright/test';
import { ORANGE_HRM_UI_TIMEOUT } from '../orangehrm.constants';

export type UserRole = 'Admin' | 'ESS';
export type UserStatus = 'Enabled' | 'Disabled';

export class AdminUsersFilterComponent {
  private readonly form: Locator;
  private readonly usernameInput: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly statusDropdown: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    const adminForm = page.locator('form').filter({
      has: page.getByRole('button', { name: /^Search$/i }),
    }).first();

    this.form = adminForm;
    this.usernameInput = this.textboxByLabel('Username');
    this.userRoleDropdown = this.dropdownByLabel('User Role');
    this.statusDropdown = this.dropdownByLabel('Status');
    this.searchButton = adminForm.getByRole('button', { name: /^Search$/i });
    this.resetButton = adminForm.getByRole('button', { name: /^Reset$/i });
  }

  public async expectReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.userRoleDropdown).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.statusDropdown).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.searchButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  public async setUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  public async selectUserRole(role: UserRole): Promise<void> {
    await this.selectDropdownOption(this.userRoleDropdown, role);
  }

  public async selectStatus(status: UserStatus): Promise<void> {
    await this.selectDropdownOption(this.statusDropdown, status);
  }

  public async submitSearch(): Promise<void> {
    await this.searchButton.click();
  }

  public async reset(): Promise<void> {
    await this.resetButton.click();
  }

  public async expectReset(): Promise<void> {
    await expect(this.usernameInput).toHaveValue('');
  }

  private dropdownByLabel(labelText: string): Locator {
    // OrangeHRM renders the visible labels separately from these custom div-based dropdowns
    // and does not expose a dependable combobox contract, so keep the relative DOM fallback here.
    return this.labelAnchor(labelText).locator(
      'xpath=following::*[contains(@class, "oxd-select-text")][1]',
    );
  }

  private async selectDropdownOption(dropdown: Locator, optionName: string): Promise<void> {
    await dropdown.click();
    await this.page.getByRole('option', {
      name: new RegExp(`^${escapeForRegex(optionName)}$`),
    }).click();
    await expect(dropdown).toContainText(optionName);
  }

  private textboxByLabel(labelText: string): Locator {
    // The Username filter is not programmatically labeled in the OrangeHRM DOM, so anchor on
    // the visible label text and keep the relative input lookup localized to this component.
    return this.labelAnchor(labelText).locator('xpath=following::input[not(@type="hidden")][1]');
  }

  private labelAnchor(labelText: string): Locator {
    return this.form.getByText(new RegExp(`^${escapeForRegex(labelText)}$`, 'i')).first();
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
