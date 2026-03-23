import { expect, type Locator, type Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';
import { ORANGE_HRM_POST_SUBMIT_TIMEOUT } from './orangehrm.constants';

export class DashboardPage {
  readonly appSidebar: Locator;
  readonly adminNavLink: Locator;
  readonly dashboardHeader: Locator;
  readonly dashboardUrlPattern: RegExp;

  constructor(private readonly page: Page) {
    this.appSidebar = page.locator('aside').first();
    this.adminNavLink = page.locator('a[href*="/admin/viewAdminModule"]').first();
    this.dashboardHeader = page.locator('.oxd-topbar-header-breadcrumb h6').first();
    this.dashboardUrlPattern = /\/web\/index\.php\/dashboard\/index/;
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/dashboard/index', 'orangehrm'));
  }

  async expectLoaded(): Promise<void> {
    await expect(this.appSidebar).toBeVisible({ timeout: ORANGE_HRM_POST_SUBMIT_TIMEOUT });
    await expect(this.adminNavLink).toBeVisible({ timeout: ORANGE_HRM_POST_SUBMIT_TIMEOUT });
    await expect(this.page).toHaveURL(this.dashboardUrlPattern, {
      timeout: ORANGE_HRM_POST_SUBMIT_TIMEOUT,
    });
  }
}
