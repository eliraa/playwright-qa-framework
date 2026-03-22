import type { Locator, Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    const loginForm = page.locator('form');
    const visibleLoginInputs = loginForm.locator('input:not([type="hidden"])');

    this.usernameInput = visibleLoginInputs.nth(0);
    this.passwordInput = visibleLoginInputs.nth(1);
    this.loginButton = loginForm.locator('button[type="submit"]');
    this.invalidCredentialsMessage = page.locator('.oxd-alert-content-text').first();
  }

  async open(): Promise<void> {
    await this.page.goto(buildAppUrl('/web/index.php/auth/login', 'orangehrm'));
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
