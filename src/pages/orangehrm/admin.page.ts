import { expect, type Locator, type Page } from '@playwright/test';

type UserRole = 'Admin' | 'ESS';
type UserStatus = 'Enabled' | 'Disabled';
type VisibleUserRow = {
  username: string;
  role: string;
  employeeName: string;
  status: string;
};

export class AdminPage {
  readonly filtersForm: Locator;
  readonly adminNavLink: Locator;
  readonly adminHeader: Locator;
  readonly usernameInput: Locator;
  readonly userRoleDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly usersTable: Locator;
  readonly userRows: Locator;
  readonly loadingSpinner: Locator;
  readonly noRecordsMessage: Locator;
  readonly adminUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    const adminForm = page.locator('form').first();
    const visibleFilterInputs = adminForm.locator('input:not([type="hidden"])');
    const filterDropdowns = adminForm.locator('.oxd-select-text');

    this.filtersForm = adminForm;
    this.adminNavLink = page.locator('a[href*="/admin/viewAdminModule"]').first();
    this.adminHeader = page.locator('.oxd-topbar-header-breadcrumb h6').first();
    this.usernameInput = visibleFilterInputs.nth(0);
    this.userRoleDropdown = filterDropdowns.nth(0);
    this.statusDropdown = filterDropdowns.nth(1);
    this.searchButton = adminForm.locator('button[type="submit"]').first();
    this.resetButton = adminForm.locator('button[type="button"]').first();
    this.usersTable = page.getByRole('table').first();
    this.userRows = this.usersTable.getByRole('row').filter({ has: page.getByRole('cell') });
    this.loadingSpinner = page.locator('.oxd-loading-spinner').first();
    this.noRecordsMessage = page.getByText(/No\s+Records?\s+Found|Keine.*gefunden/i).last();
    this.adminUrlPattern = /\/web\/index\.php\/admin\/viewSystemUsers/;
  }

  async open(): Promise<void> {
    await this.adminNavLink.click();
    await this.page.waitForURL(this.adminUrlPattern);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.usersTable).toBeVisible();
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

  async clickSearch(): Promise<void> {
    await this.searchButton.click();
    await this.waitForSearchToSettle();
  }

  async searchUserByUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.clickSearch();
  }

  async resetFilters(): Promise<void> {
    await this.resetButton.click();
    await this.waitForSearchToSettle();
    await expect(this.usernameInput).toHaveValue('');
  }

  async isUserVisible(username: string): Promise<boolean> {
    const visibleRows = await this.getVisibleUserRows();

    return visibleRows.some((row) => row.username === username);
  }

  async getVisibleRowsText(): Promise<string[]> {
    const visibleRows = await this.getVisibleUserRows();

    return visibleRows.map(({ username, role, employeeName, status }) =>
      [username, role, employeeName, status].join(' | '),
    );
  }

  private async waitForSearchToSettle(): Promise<void> {
    await this.waitForLoadingOverlayToDisappear();
    await expect(this.usersTable).toBeVisible();
    await expect
      .poll(async () => this.hasFinishedSearchState(), {
        timeout: 15_000,
      })
      .toBe(true);
  }

  private async waitForLoadingOverlayToDisappear(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2_000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 15_000 });
    } catch {
      // The live demo sometimes completes fast enough that no spinner is exposed.
    }
  }

  private async hasFinishedSearchState(): Promise<boolean> {
    if (await this.loadingSpinner.isVisible()) {
      return false;
    }

    if (await this.hasVisibleEmptyState()) {
      return true;
    }

    return this.hasVisibleResultRows();
  }

  private async hasVisibleResultRows(): Promise<boolean> {
    return (await this.getVisibleUserRows()).length > 0;
  }

  private async hasVisibleEmptyState(): Promise<boolean> {
    return this.noRecordsMessage.isVisible();
  }

  private async getVisibleUserRows(): Promise<VisibleUserRow[]> {
    return this.userRows.evaluateAll((rows) => {
      const normalize = (value: string | null | undefined): string =>
        (value ?? '')
          .split(/\r?\n/)
          .map((textChunk) => textChunk.trim())
          .filter(Boolean)
          .join(' | ');

      return rows
        .filter((row): row is HTMLElement => row instanceof HTMLElement && row.offsetParent !== null)
        .map((row) =>
          Array.from(row.querySelectorAll('[role="cell"]')).map((cell) => normalize(cell.textContent)),
        )
        .filter((cells) => cells.length >= 5)
        .map((cells) => ({
          username: cells[1] ?? '',
          role: cells[2] ?? '',
          employeeName: cells[3] ?? '',
          status: cells[4] ?? '',
        }))
        .filter((row) => row.username.length > 0);
    });
  }
}
