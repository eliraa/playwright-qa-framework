import { expect, type Locator, type Page } from '@playwright/test';
import type { UserRole } from './admin-users-filter.component';
import {
  ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
  ORANGE_HRM_UI_TIMEOUT,
} from '../orangehrm.constants';

type VisibleUserRow = {
  username: string;
  role: string;
  employeeName: string;
  status: string;
};

export class AdminUsersTableComponent {
  readonly table: Locator;
  readonly userRows: Locator;
  readonly loadingSpinner: Locator;
  readonly noRecordsMessage: Locator;

  constructor(private readonly page: Page) {
    this.table = page.getByRole('table');
    this.userRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    this.loadingSpinner = page.locator('.oxd-loading-spinner');
    this.noRecordsMessage = page
      .locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding')
      .getByText(/No\s+Records?\s+Found|Keine.*gefunden/i);
  }

  async expectReady(): Promise<void> {
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  async waitForUsersQueryToComplete(): Promise<void> {
    await this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET'
        && /\/api\/v2\/admin\/users/.test(response.url())
        && response.ok(),
      {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      },
    );
  }

  async waitForSearchToSettle(previousRowsText: string[] = []): Promise<void> {
    await this.waitForLoadingOverlayToDisappear();
    await this.expectReady();
    await expect
      .poll(async () => this.hasFinishedSearchState(previousRowsText), {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      })
      .toBe(true);
  }

  async getVisibleRowsText(): Promise<string[]> {
    const visibleRows = await this.getVisibleUserRows();

    return visibleRows.map(({ username, role, employeeName, status }) =>
      [username, role, employeeName, status].join(' | '),
    );
  }

  async isUserVisible(username: string): Promise<boolean> {
    return this.userRowByUsername(username).isVisible();
  }

  async expectUserVisible(username: string): Promise<void> {
    await expect(this.userRowByUsername(username)).toBeVisible();
  }

  async expectResultsToContain(text: string): Promise<void> {
    const visibleRowsText = await this.getVisibleRowsText();

    expect(visibleRowsText.length).toBeGreaterThan(0);
    expect(visibleRowsText.join(' ')).toContain(text);
    await expect(this.table).toContainText(text);
  }

  async expectResultsCompatibleWithRole(role: UserRole): Promise<void> {
    const visibleRows = await this.getVisibleUserRows();

    expect(visibleRows.length).toBeGreaterThan(0);

    for (const row of visibleRows) {
      expect(row.role).toBe(role);
    }
  }

  async expectNoResultsFor(username: string): Promise<void> {
    const visibleRows = await this.getVisibleUserRows();
    const hasNoRecordsMessage = await this.hasVisibleEmptyState();

    expect(visibleRows.some((row) => row.username === username)).toBe(false);

    if (hasNoRecordsMessage) {
      await expect(this.noRecordsMessage).toBeVisible();
      return;
    }

    await expect(this.table).not.toContainText(username);
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

  private async hasFinishedSearchState(previousRowsText: string[]): Promise<boolean> {
    if (await this.loadingSpinner.isVisible()) {
      return false;
    }

    if (await this.hasVisibleEmptyState()) {
      return true;
    }

    const currentRowsText = await this.getVisibleRowsText();

    if (currentRowsText.length === 0) {
      return false;
    }

    if (previousRowsText.length === 0) {
      return true;
    }

    return currentRowsText.join(' || ') !== previousRowsText.join(' || ');
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

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
