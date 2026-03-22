import type { Locator, Page } from '@playwright/test';
import { buildAppUrl } from '../../config/testEnvironment';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly invalidCredentialsMessage: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', {
      name: /^(Username|Benutzername)$/i,
    });
    this.passwordInput = page.getByRole('textbox', {
      name: /^(Password|Passwort)$/i,
    });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.invalidCredentialsMessage = page.getByText('Invalid credentials');
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
