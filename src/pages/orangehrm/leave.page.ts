import { expect, type Locator, type Page } from '@playwright/test';
import {
  ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
  ORANGE_HRM_UI_TIMEOUT,
} from './orangehrm.constants';

export type LeaveStatus = 'Rejected' | 'Cancelled' | 'Pending Approval' | 'Scheduled' | 'Taken';

export type LeaveSearchCriteria = {
  employeeName: string;
  fromDate: string;
  toDate: string;
  status: LeaveStatus;
};

export type LeaveRecordSummary = {
  date: string;
  employeeName: string;
  leaveType: string;
  status: string;
};

type LeaveColumnIndexes = {
  date: number;
  employeeName: number;
  leaveType: number;
  status: number;
};

const LEAVE_REQUESTS_API_PATH = '/web/index.php/api/v2/leave/employees/leave-requests';

export class LeavePage {
  private readonly navigationLink: Locator;
  private readonly heading: Locator;
  private readonly pageUrlPattern: RegExp;
  private readonly form: Locator;
  private readonly statusField: Locator;
  private readonly statusDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly fromDateInput: Locator;
  private readonly toDateInput: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly table: Locator;
  private readonly headerCells: Locator;
  private readonly leaveRows: Locator;
  private readonly resultsCard: Locator;
  private readonly loadingSpinner: Locator;
  private readonly noRecordsMessage: Locator;

  constructor(private readonly page: Page) {
    this.navigationLink = page.getByRole('link', { name: /^Leave$/i });
    this.heading = page.getByRole('heading', { name: /^Leave List$/i });
    this.pageUrlPattern = /\/web\/index\.php\/leave\/viewLeaveList/;
    this.form = page.locator('form').filter({
      has: page.getByRole('button', { name: /^Search$/i }),
    }).first();
    this.statusField = this.formFieldByLabel('Show Leave with Status');
    this.statusDropdown = this.statusField.locator('.oxd-select-text').first();
    this.employeeNameInput = this.autocompleteByLabel('Employee Name');
    this.fromDateInput = this.dateInputByLabel('From Date');
    this.toDateInput = this.dateInputByLabel('To Date');
    this.searchButton = this.form.getByRole('button', { name: /^Search$/i });
    this.resetButton = this.form.getByRole('button', { name: /^Reset$/i });
    this.table = page.getByRole('table').first();
    this.headerCells = this.table.getByRole('columnheader');
    this.leaveRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    this.resultsCard = page.locator('.orangehrm-paper-container').filter({
      has: this.table,
    }).first();
    this.loadingSpinner = page.locator('.oxd-loading-spinner');
    this.noRecordsMessage = this.resultsCard.getByText(/No\s+Records?\s+Found|Keine.*gefunden/i);
  }

  public async open(): Promise<void> {
    await this.navigationLink.click();
    await expect(this.page).toHaveURL(this.pageUrlPattern, {
      timeout: ORANGE_HRM_UI_TIMEOUT,
    });
    await this.expectReady();
    await this.waitForSearchToSettle();
  }

  public async searchLeaveRecords(criteria: LeaveSearchCriteria): Promise<void> {
    await this.setStatus(criteria.status);
    await this.fillDateInput(this.fromDateInput, criteria.fromDate);
    await this.fillDateInput(this.toDateInput, criteria.toDate);
    await this.setEmployeeName(criteria.employeeName);
    await this.submitSearch();
  }

  public async resetSearch(): Promise<void> {
    const leaveSearchResponse = this.waitForLeaveSearchResponse();

    await this.resetButton.click();
    await leaveSearchResponse;
    await this.waitForSearchToSettle();
  }

  public async readFirstListedLeaveRecord(): Promise<LeaveRecordSummary> {
    const [firstLeaveRecord] = await this.getVisibleLeaveRecords();

    expect(firstLeaveRecord).toBeDefined();

    return firstLeaveRecord!;
  }

  public async expectResultsToContainEmployee(employeeName: string): Promise<void> {
    const visibleRecords = await this.getVisibleLeaveRecords();

    expect(visibleRecords.length).toBeGreaterThan(0);
    expect(visibleRecords.some((record) => record.employeeName === employeeName)).toBe(true);
    await expect(this.table).toContainText(employeeName);
  }

  public async expectResultsCompatibleWithStatus(status: LeaveStatus): Promise<void> {
    const visibleRecords = await this.getVisibleLeaveRecords();

    expect(visibleRecords.length).toBeGreaterThan(0);

    for (const record of visibleRecords) {
      expect(record.status).toContain(status);
    }
  }

  public async expectNoResultsForEmployeeName(employeeName: string): Promise<void> {
    const visibleRecords = await this.getVisibleLeaveRecords();
    const hasNoRecordsMessage = await this.hasVisibleEmptyState();

    expect(visibleRecords.some((record) => record.employeeName.includes(employeeName))).toBe(false);

    if (hasNoRecordsMessage) {
      await expect(this.noRecordsMessage).toBeVisible();
      return;
    }

    await expect(this.table).not.toContainText(employeeName);
  }

  public async expectNoResults(): Promise<void> {
    const visibleRecords = await this.getVisibleLeaveRecords();

    expect(visibleRecords).toHaveLength(0);
    await expect(this.noRecordsMessage).toBeVisible();
  }

  public async expectDefaultFilters(): Promise<void> {
    const currentYear = new Date().getFullYear();

    await expect(this.employeeNameInput).toHaveValue('');
    await expect(this.fromDateInput).toHaveValue(`${currentYear}-01-01`);
    await expect(this.toDateInput).toHaveValue(`${currentYear}-31-12`);
    await expect(this.statusField).toContainText('Pending Approval');
  }

  private async expectReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.statusDropdown).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.employeeNameInput).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.searchButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  private async submitSearch(): Promise<void> {
    const leaveSearchResponse = this.waitForLeaveSearchResponse();

    await this.searchButton.click();
    await leaveSearchResponse;
    await this.waitForSearchToSettle();
  }

  private async waitForSearchToSettle(): Promise<void> {
    await this.waitForLoadingOverlayToDisappear();
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect
      .poll(async () => this.hasFinishedSearchState(), {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      })
      .toBe(true);
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
      // The live Leave page can refresh quickly enough that the overlay never appears.
    }
  }

  private async waitForLeaveSearchResponse(): Promise<void> {
    await this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET'
        && response.url().includes(LEAVE_REQUESTS_API_PATH),
      {
        timeout: ORANGE_HRM_UI_TIMEOUT,
      },
    );
  }

  private async hasFinishedSearchState(): Promise<boolean> {
    if (await this.loadingSpinner.isVisible()) {
      return false;
    }

    if (await this.hasVisibleEmptyState()) {
      return true;
    }

    const currentSnapshot = await this.getVisibleLeaveSnapshot();

    if (currentSnapshot.length === 0) {
      return false;
    }

    return true;
  }

  private async hasVisibleEmptyState(): Promise<boolean> {
    return this.noRecordsMessage.isVisible();
  }

  private async setStatus(status: LeaveStatus): Promise<void> {
    const clearIcons = this.statusField.locator('.oxd-multiselect-chips-area .--clear');

    while (await clearIcons.count()) {
      await clearIcons.first().click();
    }

    await this.statusDropdown.click();
    await this.page.getByRole('option', {
      name: new RegExp(`^${escapeForRegex(status)}$`),
    }).click();
    await expect(this.statusField).toContainText(status);
  }

  private async setEmployeeName(employeeName: string): Promise<void> {
    const normalizedEmployeeName = normalizeWhitespace(employeeName);

    await this.employeeNameInput.fill(normalizedEmployeeName);

    if (!normalizedEmployeeName) {
      return;
    }

    const matchingOption = this.page.getByRole('option', {
      name: new RegExp(`^${escapeForRegex(normalizedEmployeeName)}$`, 'i'),
    }).first();

    await matchingOption.waitFor({ state: 'visible', timeout: ORANGE_HRM_UI_TIMEOUT });
    await matchingOption.click();
  }

  private async fillDateInput(input: Locator, value: string): Promise<void> {
    await input.click();
    await input.press('Control+A');
    await input.fill(value);
    await input.press('Tab');
  }

  private async getVisibleLeaveSnapshot(): Promise<string[]> {
    const visibleRecords = await this.getVisibleLeaveRecords();

    return visibleRecords.map((record) =>
      [record.date, record.employeeName, record.leaveType, record.status].join(' | '),
    );
  }

  private async getVisibleLeaveRecords(): Promise<LeaveRecordSummary[]> {
    const columnIndexes = await this.getColumnIndexes();

    return this.leaveRows.evaluateAll((rows, indexes: LeaveColumnIndexes) => {
      const normalize = (value: string | null | undefined): string =>
        (value ?? '')
          .split(/\r?\n/)
          .map((textChunk) => textChunk.trim())
          .filter(Boolean)
          .join(' ');

      const readCell = (cells: string[], index: number): string =>
        index >= 0 ? cells[index] ?? '' : '';

      return rows
        .filter((row): row is HTMLElement => row instanceof HTMLElement && row.offsetParent !== null)
        .map((row) =>
          Array.from(row.querySelectorAll('[role="cell"]')).map((cell) => normalize(cell.textContent)),
        )
        .filter((cells) => cells.length > 0)
        .map((cells) => ({
          date: readCell(cells, indexes.date),
          employeeName: readCell(cells, indexes.employeeName),
          leaveType: readCell(cells, indexes.leaveType),
          status: readCell(cells, indexes.status),
        }))
        .filter((record) => record.date.length > 0);
    }, columnIndexes);
  }

  private async getColumnIndexes(): Promise<LeaveColumnIndexes> {
    const headerTexts = (await this.headerCells.allInnerTexts()).map((headerText) =>
      normalizeWhitespace(headerText),
    );

    const columnIndexes = {
      date: findHeaderIndex(headerTexts, /^Date/i),
      employeeName: findHeaderIndex(headerTexts, /^Employee\s+Name/i),
      leaveType: findHeaderIndex(headerTexts, /^Leave\s+Type/i),
      status: findHeaderIndex(headerTexts, /^Status/i),
    };

    expect(columnIndexes.date).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.employeeName).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.leaveType).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.status).toBeGreaterThanOrEqual(0);

    return columnIndexes;
  }

  private autocompleteByLabel(labelText: string): Locator {
    return this.formFieldByLabel(labelText).locator('input[placeholder="Type for hints..."]').first();
  }

  private dateInputByLabel(labelText: string): Locator {
    return this.formFieldByLabel(labelText).locator('input[placeholder="yyyy-dd-mm"]').first();
  }

  private formFieldByLabel(labelText: string): Locator {
    return this.labelAnchor(labelText).locator('xpath=ancestor::*[contains(@class, "oxd-grid-item")][1]');
  }

  private labelAnchor(labelText: string): Locator {
    return this.form.getByText(new RegExp(`^${escapeForRegex(labelText)}$`, 'i')).first();
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function findHeaderIndex(headerTexts: string[], headerPattern: RegExp): number {
  return headerTexts.findIndex((headerText) => headerPattern.test(headerText));
}
