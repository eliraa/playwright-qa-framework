import { expect, type Locator, type Page } from '@playwright/test';
import type { UserRole } from './admin-users-filter.component';
import {
  ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
  ORANGE_HRM_UI_TIMEOUT,
} from '../orangehrm.constants';
import {
  getOrangeHrmAdminUsersQuery,
  isOrangeHrmAdminUsersResponse,
} from '../../../support/orangehrm/admin-users.api';
import {
  describeOrangeHrmDebugError,
  logOrangeHrmDebug,
} from '../../../support/orangehrm/live-debug';

export type AdminUsersTableRow = {
  username: string;
  role: string;
  employeeName: string;
  status: string;
};

type AdminUsersColumnIndexes = {
  username: number;
  role: number;
  employeeName: number;
  status: number;
};

export class AdminUsersTableComponent {
  private readonly resultsCard: Locator;
  private readonly table: Locator;
  private readonly headerCells: Locator;
  private readonly userRows: Locator;
  private readonly loadingSpinner: Locator;
  private readonly noRecordsMessage: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table').first();
    this.headerCells = this.table.getByRole('columnheader');
    this.userRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    this.resultsCard = page.locator('.orangehrm-paper-container').filter({
      has: this.table,
    }).first();
    this.loadingSpinner = page.locator('.oxd-loading-spinner');
    // The same text can appear in a toast, so keep the empty-state lookup tied to the table card.
    this.noRecordsMessage = this.resultsCard
      .getByText(/No\s+Records?\s+Found|Keine.*gefunden/i);
  }

  public async expectReady(): Promise<void> {
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  public async waitForUsersQueryToComplete(): Promise<void> {
    const waitStartedAt = Date.now();

    logOrangeHrmDebug(this.page, 'Waiting for Admin Users API response', {
      currentUrl: this.page.url(),
    });

    try {
      const response = await this.page.waitForResponse(
        (receivedResponse) => isOrangeHrmAdminUsersResponse(receivedResponse) && receivedResponse.ok(),
        {
          timeout: ORANGE_HRM_UI_TIMEOUT,
        },
      );
      const query = getOrangeHrmAdminUsersQuery(response);

      logOrangeHrmDebug(this.page, 'Admin Users API response received', {
        durationMs: Date.now() - waitStartedAt,
        status: response.status(),
        url: response.url(),
        username: query.get('username'),
        limit: query.get('limit'),
        offset: query.get('offset'),
      });
    } catch (error) {
      logOrangeHrmDebug(this.page, 'Admin Users API response wait failed', {
        durationMs: Date.now() - waitStartedAt,
        currentUrl: this.page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }
  }

  public async waitForSearchToSettle(previousUsersSnapshot: string[] = []): Promise<void> {
    await this.waitForLoadingOverlayToDisappear();
    await this.expectReady();
    // The demo can keep stale rows visible briefly after the response resolves, so wait for
    // either a real empty state or a changed set of visible rows.
    await expect
      .poll(async () => this.hasFinishedSearchState(previousUsersSnapshot), {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      })
      .toBe(true);
  }

  public async getVisibleUsersSnapshot(): Promise<string[]> {
    const visibleUsers = await this.getVisibleUsers();

    return visibleUsers.map(({ username, role, employeeName, status }) =>
      [username, role, employeeName, status].join(' | '),
    );
  }

  public async expectUserVisible(username: string): Promise<void> {
    await expect(this.userRowByUsername(username)).toBeVisible();
  }

  public async expectResultsToContain(text: string): Promise<void> {
    const visibleUsersSnapshot = await this.getVisibleUsersSnapshot();

    expect(visibleUsersSnapshot.length).toBeGreaterThan(0);
    expect(visibleUsersSnapshot.join(' ')).toContain(text);
    await expect(this.table).toContainText(text);
  }

  public async expectResultsCompatibleWithRole(role: UserRole): Promise<void> {
    const visibleUsers = await this.getVisibleUsers();

    expect(visibleUsers.length).toBeGreaterThan(0);

    for (const user of visibleUsers) {
      expect(user.role).toBe(role);
    }
  }

  public async expectNoResultsFor(username: string): Promise<void> {
    const visibleUsers = await this.getVisibleUsers();
    const hasNoRecordsMessage = await this.hasVisibleEmptyState();

    expect(visibleUsers.some((user) => user.username === username)).toBe(false);

    if (hasNoRecordsMessage) {
      await expect(this.noRecordsMessage).toBeVisible();
      return;
    }

    await expect(this.table).not.toContainText(username);
  }

  public async expectVisibleRowCount(expectedCount: number): Promise<void> {
    const visibleUsers = await this.getVisibleUsers();

    expect(visibleUsers).toHaveLength(expectedCount);
  }

  public async expectVisibleRows(expectedRows: AdminUsersTableRow[]): Promise<void> {
    const visibleUsers = await this.getVisibleUsers();

    expect(normalizeRowsForComparison(visibleUsers)).toEqual(
      normalizeRowsForComparison(expectedRows),
    );
  }

  private async waitForLoadingOverlayToDisappear(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({
        state: 'visible',
        timeout: ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
      });
      await this.loadingSpinner.waitFor({
        state: 'hidden',
        timeout: ORANGE_HRM_UI_TIMEOUT,
      });
    } catch {
      // The live demo sometimes completes fast enough that no spinner is exposed.
    }
  }

  private async hasFinishedSearchState(previousUsersSnapshot: string[]): Promise<boolean> {
    if (await this.loadingSpinner.isVisible()) {
      return false;
    }

    if (await this.hasVisibleEmptyState()) {
      return true;
    }

    const currentUsersSnapshot = await this.getVisibleUsersSnapshot();

    if (currentUsersSnapshot.length === 0) {
      return false;
    }

    if (previousUsersSnapshot.length === 0) {
      return true;
    }

    return currentUsersSnapshot.join(' || ') !== previousUsersSnapshot.join(' || ');
  }

  private async hasVisibleEmptyState(): Promise<boolean> {
    return this.noRecordsMessage.isVisible();
  }

  private userRowByUsername(username: string): Locator {
    return this.userRows.filter({
      has: this.page.getByRole('cell', {
        name: new RegExp(`^${escapeForRegex(username)}$`),
      }),
    }).first();
  }

  private async getVisibleUsers(): Promise<AdminUsersTableRow[]> {
    const columnIndexes = await this.getColumnIndexes();

    // OrangeHRM does not expose stable test IDs or label relationships inside this grid,
    // so keep the DOM-based parsing localized and resolve the data cells from visible headers.
    return this.userRows.evaluateAll((rows, indexes: AdminUsersColumnIndexes) => {
      const normalize = (value: string | null | undefined): string =>
        (value ?? '')
          .split(/\r?\n/)
          .map((textChunk) => textChunk.trim())
          .filter(Boolean)
          .join(' | ');

      const readCell = (cells: string[], index: number): string =>
        index >= 0 ? cells[index] ?? '' : '';

      return rows
        .filter((row): row is HTMLElement => row instanceof HTMLElement && row.offsetParent !== null)
        .map((row) =>
          Array.from(row.querySelectorAll('[role="cell"]')).map((cell) => normalize(cell.textContent)),
        )
        .filter((cells) => cells.length > 0)
        .map((cells) => ({
          username: readCell(cells, indexes.username),
          role: readCell(cells, indexes.role),
          employeeName: readCell(cells, indexes.employeeName),
          status: readCell(cells, indexes.status),
        }))
        .filter((row) => row.username.length > 0);
    }, columnIndexes);
  }

  private async getColumnIndexes(): Promise<AdminUsersColumnIndexes> {
    const headerTexts = (await this.headerCells.allInnerTexts()).map((headerText) =>
      normalizeWhitespace(headerText),
    );

    const columnIndexes = {
      username: findHeaderIndex(headerTexts, /^Username$/i),
      role: findHeaderIndex(headerTexts, /^User Role$/i),
      employeeName: findHeaderIndex(headerTexts, /^Employee Name$/i),
      status: findHeaderIndex(headerTexts, /^Status$/i),
    };

    expect(columnIndexes.username).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.role).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.employeeName).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.status).toBeGreaterThanOrEqual(0);

    return columnIndexes;
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeRowsForComparison(rows: AdminUsersTableRow[]): AdminUsersTableRow[] {
  return [...rows].sort((leftRow, rightRow) =>
    [leftRow.username, leftRow.role, leftRow.employeeName, leftRow.status]
      .join('|')
      .localeCompare(
        [rightRow.username, rightRow.role, rightRow.employeeName, rightRow.status].join('|'),
      ),
  );
}

function normalizeWhitespace(value: string): string {
  return value
    .split(/\r?\n/)
    .map((textChunk) => textChunk.trim())
    .filter(Boolean)
    .join(' ');
}

function findHeaderIndex(headerTexts: string[], headerPattern: RegExp): number {
  return headerTexts.findIndex((headerText) => headerPattern.test(headerText));
}
