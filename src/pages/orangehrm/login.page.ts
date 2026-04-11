import { expect, type Locator, type Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';
import {
  describeOrangeHrmDebugError,
  logOrangeHrmDebug,
} from '../../support/orangehrm/live-debug';
import { ORANGE_HRM_UI_TIMEOUT } from './orangehrm.constants';

export class LoginPage {
  private readonly loginUrlPattern: RegExp;
  private readonly loginHeading: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly invalidCredentialsAlert: Locator;
  private readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.loginUrlPattern = /\/web\/index\.php\/auth\/login/;
    this.loginHeading = page.getByRole('heading', { name: /^Login$/i });
    this.usernameInput = page.getByPlaceholder(/^Username$/i);
    this.passwordInput = page.getByPlaceholder(/^Password$/i);
    this.loginButton = page.getByRole('button', { name: /^Login$/i });
    // OrangeHRM does not expose a dependable alert role on this banner, so keep the
    // CSS fallback isolated here and scope the text lookup to the banner itself.
    this.invalidCredentialsAlert = page.locator('.oxd-alert').filter({
      has: page.getByText(/^Invalid credentials$/i),
    }).first();
    this.invalidCredentialsMessage = this.invalidCredentialsAlert.getByText(
      /^Invalid credentials$/i,
    );
  }

  public async open(): Promise<void> {
    const loginUrl = buildAppUrl('/web/index.php/auth/login', 'orangehrm');
    const navigationStartedAt = Date.now();

    logOrangeHrmDebug(this.page, 'Navigating to OrangeHRM login page', {
      url: loginUrl,
    });

    try {
      await this.page.goto(loginUrl, {
        waitUntil: 'domcontentloaded',
      });
      logOrangeHrmDebug(this.page, 'OrangeHRM login navigation completed', {
        durationMs: Date.now() - navigationStartedAt,
        currentUrl: this.page.url(),
      });
    } catch (error) {
      logOrangeHrmDebug(this.page, 'OrangeHRM login navigation failed', {
        durationMs: Date.now() - navigationStartedAt,
        currentUrl: this.page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }

    await expect(this.page).toHaveURL(this.loginUrlPattern, {
      timeout: ORANGE_HRM_UI_TIMEOUT,
    });
    await this.expectReady();
  }

  public async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  public async expectInvalidCredentialsError(): Promise<void> {
    await expect(this.invalidCredentialsAlert).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.invalidCredentialsMessage).toContainText('Invalid credentials');
  }

  private async expectReady(): Promise<void> {
    // The live demo can report the login route as loaded while the page is still blank.
    // Wait for the login shell first, then the actionable control.
    try {
      await expect(this.loginHeading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
      await expect(this.loginButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
      logOrangeHrmDebug(this.page, 'OrangeHRM login page is ready', {
        currentUrl: this.page.url(),
      });
    } catch (error) {
      logOrangeHrmDebug(this.page, 'OrangeHRM login page did not become ready', {
        currentUrl: this.page.url(),
        error: describeOrangeHrmDebugError(error),
      });
      throw error;
    }
  }
}
