import { expect, type Locator, type Page } from '@playwright/test';
import {
  ORANGE_HRM_LOADING_OVERLAY_APPEAR_TIMEOUT,
  ORANGE_HRM_UI_TIMEOUT,
} from './orangehrm.constants';

export type ClaimRecordSummary = {
  referenceId: string;
  employeeName: string;
  eventName: string;
  status: string;
};

export type ClaimSearchCriteria = {
  referenceId: string;
  status: string;
};

type ClaimColumnIndexes = {
  referenceId: number;
  employeeName: number;
  eventName: number;
  status: number;
};

export class ClaimPage {
  private readonly navigationLink: Locator;
  private readonly heading: Locator;
  private readonly pageUrlPattern: RegExp;
  private readonly form: Locator;
  private readonly referenceIdInput: Locator;
  private readonly statusDropdown: Locator;
  private readonly searchButton: Locator;
  private readonly table: Locator;
  private readonly headerCells: Locator;
  private readonly claimRows: Locator;
  private readonly resultsCard: Locator;
  private readonly loadingSpinner: Locator;
  private readonly noRecordsMessage: Locator;

  constructor(private readonly page: Page) {
    this.navigationLink = page.getByRole('link', { name: /^Claim$/i });
    this.heading = page.getByRole('heading', { name: /^Employee Claims$/i });
    this.pageUrlPattern = /\/web\/index\.php\/claim\/viewAssignClaim/;
    this.form = page.locator('form').filter({
      has: page.getByRole('button', { name: /^Search$/i }),
    }).first();
    this.referenceIdInput = this.textboxByLabel('Reference Id');
    this.statusDropdown = this.dropdownByLabel('Status');
    this.searchButton = this.form.getByRole('button', { name: /^Search$/i });
    this.table = page.getByRole('table').first();
    this.headerCells = this.table.getByRole('columnheader');
    this.claimRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
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

  public async readFirstListedClaim(): Promise<ClaimRecordSummary> {
    const [firstClaim] = await this.getVisibleClaims();

    expect(firstClaim).toBeDefined();

    return firstClaim!;
  }

  public async searchClaims(criteria: ClaimSearchCriteria): Promise<void> {
    await this.referenceIdInput.fill(criteria.referenceId);
    await this.selectStatus(criteria.status);
    await this.submitSearch();
  }

  public async searchClaimsByStatus(status: string): Promise<void> {
    await this.selectStatus(status);
    await this.submitSearch();
  }

  public async searchClaimByReferenceId(referenceId: string): Promise<void> {
    await this.referenceIdInput.fill(referenceId);
    await this.submitSearch();
  }

  public async expectClaimVisible(claim: ClaimRecordSummary): Promise<void> {
    await expect(this.claimRowByReferenceId(claim.referenceId)).toBeVisible();
    await expect(this.table).toContainText(claim.employeeName);
    await expect(this.table).toContainText(claim.eventName);
  }

  public async expectResultsCompatibleWithStatus(status: string): Promise<void> {
    await this.expectResultsCompatibleWithSearch({ status });
  }

  public async expectResultsCompatibleWithSearch(
    filters: Partial<Pick<ClaimSearchCriteria, 'referenceId' | 'status'>>,
  ): Promise<void> {
    const visibleClaims = await this.getVisibleClaims();

    expect(visibleClaims.length).toBeGreaterThan(0);

    for (const claim of visibleClaims) {
      if (filters.referenceId) {
        expect(claim.referenceId).toBe(filters.referenceId);
      }

      if (filters.status) {
        expect(claim.status).toBe(filters.status);
      }
    }
  }

  public async expectVisibleClaims(expectedClaims: ClaimRecordSummary[]): Promise<void> {
    const visibleClaims = await this.getVisibleClaims();

    expect(normalizeClaimsForComparison(visibleClaims)).toEqual(
      normalizeClaimsForComparison(expectedClaims),
    );
  }

  public async expectNoResultsForReferenceId(referenceId: string): Promise<void> {
    const visibleClaims = await this.getVisibleClaims();
    const hasNoRecordsMessage = await this.hasVisibleEmptyState();

    expect(visibleClaims.some((claim) => claim.referenceId === referenceId)).toBe(false);

    if (hasNoRecordsMessage) {
      await expect(this.noRecordsMessage).toBeVisible();
      return;
    }

    await expect(this.table).not.toContainText(referenceId);
  }

  private async expectReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.referenceIdInput).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.statusDropdown).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.searchButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }

  private async selectStatus(status: string): Promise<void> {
    await this.statusDropdown.click();
    await this.page.getByRole('option', {
      name: new RegExp(`^${escapeForRegex(status)}$`, 'i'),
    }).click();
    await expect(this.statusDropdown).toContainText(status);
  }

  private async submitSearch(): Promise<void> {
    const previousSnapshot = await this.getVisibleClaimSnapshot();

    await this.searchButton.click();
    await this.waitForSearchToSettle(previousSnapshot);
  }

  private async waitForSearchToSettle(previousSnapshot: string[] = []): Promise<void> {
    await this.waitForLoadingOverlayToDisappear();
    await expect(this.table).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect
      .poll(async () => this.hasFinishedSearchState(previousSnapshot), {
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
      // The Claim list can refresh without surfacing the transient loading overlay.
    }
  }

  private async hasFinishedSearchState(previousSnapshot: string[]): Promise<boolean> {
    if (await this.loadingSpinner.isVisible()) {
      return false;
    }

    if (await this.hasVisibleEmptyState()) {
      return true;
    }

    const currentSnapshot = await this.getVisibleClaimSnapshot();

    if (currentSnapshot.length === 0) {
      return false;
    }

    if (previousSnapshot.length === 0) {
      return true;
    }

    return currentSnapshot.join(' || ') !== previousSnapshot.join(' || ');
  }

  private async hasVisibleEmptyState(): Promise<boolean> {
    return this.noRecordsMessage.isVisible();
  }

  private claimRowByReferenceId(referenceId: string): Locator {
    return this.claimRows.filter({
      has: this.page.getByRole('cell', {
        name: new RegExp(`^${escapeForRegex(referenceId)}$`),
      }),
    }).first();
  }

  private async getVisibleClaimSnapshot(): Promise<string[]> {
    const visibleClaims = await this.getVisibleClaims();

    return visibleClaims.map((claim) =>
      [claim.referenceId, claim.employeeName, claim.eventName, claim.status].join(' | '),
    );
  }

  private async getVisibleClaims(): Promise<ClaimRecordSummary[]> {
    const columnIndexes = await this.getColumnIndexes();

    return this.claimRows.evaluateAll((rows, indexes: ClaimColumnIndexes) => {
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
          referenceId: readCell(cells, indexes.referenceId),
          employeeName: readCell(cells, indexes.employeeName),
          eventName: readCell(cells, indexes.eventName),
          status: readCell(cells, indexes.status),
        }))
        .filter((claim) => claim.referenceId.length > 0);
    }, columnIndexes);
  }

  private async getColumnIndexes(): Promise<ClaimColumnIndexes> {
    const headerTexts = (await this.headerCells.allInnerTexts()).map((headerText) =>
      normalizeWhitespace(headerText),
    );

    const columnIndexes = {
      referenceId: findHeaderIndex(headerTexts, /^Reference\s+Id/i),
      employeeName: findHeaderIndex(headerTexts, /^Employee\s+Name/i),
      eventName: findHeaderIndex(headerTexts, /^Event\s+Name/i),
      status: findHeaderIndex(headerTexts, /^Status/i),
    };

    expect(columnIndexes.referenceId).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.employeeName).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.eventName).toBeGreaterThanOrEqual(0);
    expect(columnIndexes.status).toBeGreaterThanOrEqual(0);

    return columnIndexes;
  }

  private dropdownByLabel(labelText: string): Locator {
    // OrangeHRM renders these custom dropdowns as divs instead of native selects,
    // so keep the relative fallback constrained to the local form field.
    return this.formFieldByLabel(labelText).locator('.oxd-select-text').first();
  }

  private textboxByLabel(labelText: string): Locator {
    return this.formFieldByLabel(labelText).locator('input:not([type="hidden"])').first();
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
  return value
    .split(/\r?\n/)
    .map((textChunk) => textChunk.trim())
    .filter(Boolean)
    .join(' ');
}

function findHeaderIndex(headerTexts: string[], headerPattern: RegExp): number {
  return headerTexts.findIndex((headerText) => headerPattern.test(headerText));
}

function normalizeClaimsForComparison(claims: ClaimRecordSummary[]): ClaimRecordSummary[] {
  return [...claims].sort((leftClaim, rightClaim) =>
    [leftClaim.referenceId, leftClaim.employeeName, leftClaim.eventName, leftClaim.status]
      .join('|')
      .localeCompare(
        [rightClaim.referenceId, rightClaim.employeeName, rightClaim.eventName, rightClaim.status]
          .join('|'),
      ),
  );
}
