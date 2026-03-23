import { expect, type Page } from '@playwright/test';
import {
  AdminUsersFilterComponent,
  type UserRole,
  type UserStatus,
} from './components/admin-users-filter.component';
import { AdminUsersTableComponent } from './components/admin-users-table.component';
import { ORANGE_HRM_UI_TIMEOUT } from './orangehrm.constants';

export type { UserRole, UserStatus } from './components/admin-users-filter.component';

export class AdminPage {
  readonly filters: AdminUsersFilterComponent;
  readonly usersTable: AdminUsersTableComponent;
  readonly adminUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.filters = new AdminUsersFilterComponent(page);
    this.usersTable = new AdminUsersTableComponent(page);
    this.adminUrlPattern = /\/web\/index\.php\/admin\/viewSystemUsers/;
  }

  async open(): Promise<void> {
    await this.page.getByRole('link', { name: /^Admin$/ }).click();
    await expect(this.page).toHaveURL(this.adminUrlPattern, {
      timeout: ORANGE_HRM_UI_TIMEOUT,
    });
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await this.filters.expectReady();
    await this.usersTable.expectReady();
  }

  async setUsernameFilter(username: string): Promise<void> {
    await this.filters.setUsername(username);
  }

  async setUserRoleFilter(role: UserRole): Promise<void> {
    await this.filters.selectUserRole(role);
  }

  async setStatusFilter(status: UserStatus): Promise<void> {
    await this.filters.selectStatus(status);
  }

  async clickSearch(): Promise<void> {
    const previousRowsText = await this.usersTable.getVisibleRowsText();
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();

    await this.filters.submitSearch();
    await usersQuery;
    await this.usersTable.waitForSearchToSettle(previousRowsText);
  }

  async searchUserByUsername(username: string): Promise<void> {
    await this.setUsernameFilter(username);
    await this.clickSearch();
  }

  async searchByUserRole(role: UserRole): Promise<void> {
    await this.setUserRoleFilter(role);
    await this.clickSearch();
  }

  async searchByUsernameAndRole(username: string, role: UserRole): Promise<void> {
    await this.setUsernameFilter(username);
    await this.setUserRoleFilter(role);
    await this.clickSearch();
  }

  async resetFilters(): Promise<void> {
    const previousRowsText = await this.usersTable.getVisibleRowsText();
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();

    await this.filters.reset();
    await usersQuery;
    await this.usersTable.waitForSearchToSettle(previousRowsText);
    await this.filters.expectReset();
  }

  async getVisibleRowsText(): Promise<string[]> {
    return this.usersTable.getVisibleRowsText();
  }

  async isUserVisible(username: string): Promise<boolean> {
    return this.usersTable.isUserVisible(username);
  }

  async expectUserVisible(username: string): Promise<void> {
    await this.usersTable.expectUserVisible(username);
  }

  async expectResultsToContain(text: string): Promise<void> {
    await this.usersTable.expectResultsToContain(text);
  }

  async expectResultsCompatibleWithRole(role: UserRole): Promise<void> {
    await this.usersTable.expectResultsCompatibleWithRole(role);
  }

  async expectNoResultsFor(username: string): Promise<void> {
    await this.usersTable.expectNoResultsFor(username);
  }
}
