import { expect, type Locator, type Page } from '@playwright/test';
import {
  AdminUsersFilterComponent,
  type UserRole,
  type UserStatus,
} from './components/admin-users-filter.component';
import {
  AdminUsersTableComponent,
  type AdminUsersTableRow,
} from './components/admin-users-table.component';
import {
  describeOrangeHrmDebugError,
  logOrangeHrmDebug,
} from '../../support/orangehrm/live-debug';
import { ORANGE_HRM_UI_TIMEOUT } from './orangehrm.constants';

export type { UserRole, UserStatus } from './components/admin-users-filter.component';
export type { AdminUsersTableRow } from './components/admin-users-table.component';

export class AdminPage {
  private readonly adminNavLink: Locator;
  private readonly filters: AdminUsersFilterComponent;
  private readonly usersTable: AdminUsersTableComponent;
  private readonly adminUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.adminNavLink = page.getByRole('link', { name: /^Admin$/i });
    this.filters = new AdminUsersFilterComponent(page);
    this.usersTable = new AdminUsersTableComponent(page);
    this.adminUrlPattern = /\/web\/index\.php\/admin\/viewSystemUsers/;
  }

  public async open(): Promise<void> {
    const openStartedAt = Date.now();
    const initialUsersQuery = this.usersTable.waitForUsersQueryToComplete();

    logOrangeHrmDebug(this.page, 'Opening OrangeHRM Admin page');

    try {
      await this.adminNavLink.click();
      await expect(this.page).toHaveURL(this.adminUrlPattern, {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      });
      await this.expectLoaded();
      // The Admin shell becomes visible before the first users query reliably settles,
      // so finish that initial data load here to avoid a late live response overwriting
      // the next search state.
      await initialUsersQuery;
      await this.usersTable.waitForSearchToSettle();
      logOrangeHrmDebug(this.page, 'OrangeHRM Admin page finished loading', {
        durationMs: Date.now() - openStartedAt,
        currentUrl: this.page.url(),
      });
    } catch (error) {
      logOrangeHrmDebug(this.page, 'OrangeHRM Admin page failed to load', {
        durationMs: Date.now() - openStartedAt,
        currentUrl: this.page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }
  }

  private async expectLoaded(): Promise<void> {
    await this.filters.expectReady();
    await this.usersTable.expectReady();
  }

  private async setUsernameFilter(username: string): Promise<void> {
    await this.filters.setUsername(username);
  }

  private async setUserRoleFilter(role: UserRole): Promise<void> {
    await this.filters.selectUserRole(role);
  }

  private async setStatusFilter(status: UserStatus): Promise<void> {
    await this.filters.selectStatus(status);
  }

  private async clickSearch(): Promise<void> {
    const previousRowsText = await this.usersTable.getVisibleUsersSnapshot();
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();
    const searchStartedAt = Date.now();

    logOrangeHrmDebug(this.page, 'Submitting Admin Users search', {
      previousVisibleRows: previousRowsText.length,
      currentUrl: this.page.url(),
    });

    try {
      await this.filters.submitSearch();
      await usersQuery;
      await this.usersTable.waitForSearchToSettle(previousRowsText);
      logOrangeHrmDebug(this.page, 'Admin Users search finished', {
        durationMs: Date.now() - searchStartedAt,
        currentUrl: this.page.url(),
      });
    } catch (error) {
      logOrangeHrmDebug(this.page, 'Admin Users search failed', {
        durationMs: Date.now() - searchStartedAt,
        currentUrl: this.page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }
  }

  public async searchUserByUsername(username: string): Promise<void> {
    await this.setUsernameFilter(username);
    await this.clickSearch();
  }

  public async searchByUserRole(role: UserRole): Promise<void> {
    await this.setUserRoleFilter(role);
    await this.clickSearch();
  }

  public async searchByUsernameAndRole(username: string, role: UserRole): Promise<void> {
    await this.setUsernameFilter(username);
    await this.setUserRoleFilter(role);
    await this.clickSearch();
  }

  private async resetFilters(): Promise<void> {
    const previousRowsText = await this.usersTable.getVisibleUsersSnapshot();
    const usersQuery = this.usersTable.waitForUsersQueryToComplete();

    await this.filters.reset();
    await usersQuery;
    await this.usersTable.waitForSearchToSettle(previousRowsText);
    await this.filters.expectReset();
  }

  public async expectUserVisible(username: string): Promise<void> {
    await this.usersTable.expectUserVisible(username);
  }

  public async expectResultsToContain(text: string): Promise<void> {
    await this.usersTable.expectResultsToContain(text);
  }

  public async expectResultsCompatibleWithRole(role: UserRole): Promise<void> {
    await this.usersTable.expectResultsCompatibleWithRole(role);
  }

  public async expectNoResultsFor(username: string): Promise<void> {
    await this.usersTable.expectNoResultsFor(username);
  }

  public async expectVisibleRowCount(expectedCount: number): Promise<void> {
    await this.usersTable.expectVisibleRowCount(expectedCount);
  }

  public async expectVisibleRows(expectedRows: AdminUsersTableRow[]): Promise<void> {
    await this.usersTable.expectVisibleRows(expectedRows);
  }
}
