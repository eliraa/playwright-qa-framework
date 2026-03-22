import type { Locator, Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';

export class DashboardPage {
  readonly dashboardHeader: Locator;
  readonly dashboardUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.dashboardHeader = page.getByRole('heading', { name: 'Dashboard' });
    this.dashboardUrlPattern = /\/web\/index\.php\/dashboard\/index/;
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/dashboard/index', 'orangehrm'));
  }
}
