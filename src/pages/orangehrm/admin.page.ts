import { expect, type Page } from '@playwright/test';
import {
  AdminUsersFilterComponent,
  type UserRole,
  type UserStatus,
} from './components/admin-users-filter.component';
import { AdminUsersTableComponent } from './components/admin-users-table.component';

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
    await this.page.locator('a[href*="/admin/viewAdminModule"]').first().click();
    await this.page.waitForURL(this.adminUrlPattern);
    await expect(this.page.locator('.oxd-topbar-header-breadcrumb h6').first()).toBeVisible();
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
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();

    await this.filters.submitSearch();
    await usersQuery;
    await this.usersTable.waitForSearchToSettle();
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
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();

    await this.filters.reset();
    await usersQuery;
    await this.usersTable.waitForSearchToSettle();
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
