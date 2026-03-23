import { expect, type Locator, type Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';
import { ORANGE_HRM_LOGIN_READY_TIMEOUT } from './orangehrm.constants';

export class LoginPage {
  readonly loginUrlPattern: RegExp;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    const loginForm = page.locator('form');
    const visibleLoginInputs = loginForm.locator('input:not([type="hidden"])');

    this.loginUrlPattern = /\/web\/index\.php\/auth\/login/;
    this.usernameInput = visibleLoginInputs.nth(0);
    this.passwordInput = visibleLoginInputs.nth(1);
    this.loginButton = loginForm.locator('button[type="submit"]');
    this.invalidCredentialsMessage = page.locator('.oxd-alert-content-text').first();
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/auth/login', 'orangehrm'), {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForURL(this.loginUrlPattern, {
      timeout: ORANGE_HRM_LOGIN_READY_TIMEOUT,
      waitUntil: 'domcontentloaded',
    });
    await this.expectReady();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible({ timeout: ORANGE_HRM_LOGIN_READY_TIMEOUT });
    await expect(this.passwordInput).toBeVisible({ timeout: ORANGE_HRM_LOGIN_READY_TIMEOUT });
    await expect(this.loginButton).toBeVisible({ timeout: ORANGE_HRM_LOGIN_READY_TIMEOUT });
  }
}
