import { expect, type Locator, type Page } from '@playwright/test';
import {
  ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
  ORANGE_HRM_UI_TIMEOUT,
} from './orangehrm.constants';

export type PimEmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
};

type PimColumnIndexes = {
  id: number;
  firstName: number;
  lastName: number;
};

const PIM_EMPLOYEES_API_PATH = '/web/index.php/api/v2/pim/employees';

export class PimPage {
  private readonly navigationLink: Locator;
  private readonly heading: Locator;
  private readonly pageUrlPattern: RegExp;
  private readonly form: Locator;
  private readonly employeeIdInput: Locator;
  private readonly searchButton: Locator;
  private readonly table: Locator;
  private readonly headerCells: Locator;
  private readonly employeeRows: Locator;
  private readonly resultsCard: Locator;
  private readonly loadingSpinner: Locator;
  private readonly noRecordsMessage: Locator;

  constructor(private readonly page: Page) {
    this.navigationLink = page.getByRole('link', { name: /^PIM$/i });
    this.heading = page.getByRole('heading', { name: /^Employee Information$/i });
    this.pageUrlPattern = /\/web\/index\.php\/pim\/viewEmployeeList/;
    this.form = page.locator('form').filter({
      has: page.getByRole('button', { name: /^Search$/i }),
    }).first();
    this.employeeIdInput = this.textboxByLabel('Employee Id');
    this.searchButton = this.form.getByRole('button', { name: /^Search$/i });
    this.table = page.getByRole('table').first();
    this.headerCells = this.table.getByRole('columnheader');
    this.employeeRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
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

  public async readFirstListedEmployee(): Promise<PimEmployeeSummary> {
    const [firstEmployee] = await this.getVisibleEmployees();

    expect(firstEmployee).toBeDefined();

    return firstEmployee!;
  }

  public async searchEmployeeById(employeeId: string): Promise<void> {
    await this.employeeIdInput.fill(employeeId);
    await this.submitSearch();
  }

  public async expectEmployeeVisible(employee: PimEmployeeSummary): Promise<void> {
    await expect(this.employeeRowById(employee.id)).toBeVisible();
    await expect(this.table).toContainText(employee.firstName);
    await expect(this.table).toContainText(employee.lastName);
  }

  public async expectNoResultsForEmployeeId(employeeId: string): Promise<void> {
    const visibleEmployees = await this.getVisibleEmployees();
    const hasNoRecordsMessage = await this.hasVisibleEmptyState();

    expect(visibleEmployees.some((employee) => employee.id === employeeId)).toBe(false);

    if (hasNoRecordsMessage) {
      await expect(this.noRecordsMessage).toBeVisible();
      return;
    }

    await expect(this.table).not.toContainText(employeeId);
  }

  private async expectReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.employeeIdInput).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.searchButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  private async submitSearch(): Promise<void> {
    const employeesResponse = this.waitForEmployeesResponse();

    await this.searchButton.click();
    await employeesResponse;
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
      // The live demo sometimes refreshes the table without exposing the overlay.
    }
  }

  private async waitForEmployeesResponse(): Promise<void> {
    await this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET'
        && response.url().includes(PIM_EMPLOYEES_API_PATH),
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

    const currentEmployees = await this.getVisibleEmployees();

    if (currentEmployees.length === 0) {
      return false;
    }

    return true;
  }

  private async hasVisibleEmptyState(): Promise<boolean> {
    return this.noRecordsMessage.isVisible();
  }

  private employeeRowById(employeeId: string): Locator {
    return this.employeeRows.filter({
      has: this.page.getByRole('cell', {
        name: new RegExp(`^${escapeForRegex(employeeId)}$`),
      }),
    }).first();
  }
  private async getVisibleEmployees(): Promise<PimEmployeeSummary[]> {
    const columnIndexes = await this.getColumnIndexes();

    return this.employeeRows.evaluateAll((rows, indexes: PimColumnIndexes) => {
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
          id: readCell(cells, indexes.id),
          firstName: readCell(cells, indexes.firstName),
          lastName: readCell(cells, indexes.lastName),
        }))
        .filter((employee) => employee.id.length > 0);
    }, columnIndexes);
  }

  private async getColumnIndexes(): Promise<PimColumnIndexes> {
    const headerTexts = (await this.headerCells.allInnerTexts()).map((headerText) =>
      normalizeWhitespace(headerText),
    );

    const columnIndexes = {
      id: findHeaderIndex(headerTexts, /^Id/i),
      firstName: findHeaderIndex(headerTexts, /^First\s*\(&\s*Middle\)\s*Name/i),
      lastName: findHeaderIndex(headerTexts, /^Last\s+Name/i),
    };

    expect(columnIndexes.id).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.firstName).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.lastName).toBeGreaterThanOrEqual(0);

    return columnIndexes;
  }

  private textboxByLabel(labelText: string): Locator {
    // OrangeHRM renders visible labels separately from these inputs, so keep the
    // relative lookup anchored to the local search form.
    return this.labelAnchor(labelText).locator('xpath=following::input[not(@type="hidden")][1]');
  }

  private labelAnchor(labelText: string): Locator {
    return this.form.getByText(new RegExp(`^${escapeForRegex(labelText)}$`, 'i')).first();
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
