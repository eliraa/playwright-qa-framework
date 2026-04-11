import { expect, type Locator, type Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';
import { ORANGE_HRM_UI_TIMEOUT } from './orangehrm.constants';

export class DashboardPage {
  readonly adminNavLink: Locator;
  readonly dashboardHeading: Locator;
  readonly dashboardUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.adminNavLink = page.getByRole('link', { name: /^Admin$/i });
    this.dashboardHeading = page.getByRole('heading', { name: /^Dashboard$/i });
    this.dashboardUrlPattern = /\/web\/index\.php\/dashboard\/index/;
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/dashboard/index', 'orangehrm'), {
      waitUntil: 'domcontentloaded',
    });
  }

  async expectLoaded(): Promise<void> {
    // The demo often updates the route before the authenticated shell is fully usable.
    // Gate on stable dashboard UI first, then confirm the final URL.
    await expect(this.adminNavLink).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.dashboardHeading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.page).toHaveURL(this.dashboardUrlPattern, {
      timeout: ORANGE_HRM_UI_TIMEOUT,
    });
  }
}
