import { expect, type Locator, type Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';
import { ORANGE_HRM_UI_TIMEOUT } from './orangehrm.constants';

export class LoginPage {
  readonly loginUrlPattern: RegExp;
  readonly loginHeading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly invalidCredentialsAlert: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.loginUrlPattern = /\/web\/index\.php\/auth\/login/;
    this.loginHeading = page.getByRole('heading', { name: /^Login$/i });
    this.usernameInput = page.getByPlaceholder(/^Username$/i);
    this.passwordInput = page.getByPlaceholder(/^Password$/i);
    this.loginButton = page.getByRole('button', { name: /^Login$/i });
    this.invalidCredentialsMessage = page.getByText(/^Invalid credentials$/i);
    this.invalidCredentialsAlert = page.locator('.oxd-alert').filter({
      has: this.invalidCredentialsMessage,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/auth/login', 'orangehrm'), {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.page).toHaveURL(this.loginUrlPattern, {
      timeout: ORANGE_HRM_UI_TIMEOUT,
    });
    await this.expectReady();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectReady(): Promise<void> {
    // The live demo can report the login route as loaded while the page is still blank.
    // Wait for the login shell first, then the actionable control.
    await expect(this.loginHeading).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
    await expect(this.loginButton).toBeVisible({ timeout: ORANGE_HRM_UI_TIMEOUT });
  }
}
