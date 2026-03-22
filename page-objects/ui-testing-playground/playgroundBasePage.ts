import type { Page } from '@playwright/test';

export class PlaygroundBasePage {
  constructor(
    protected readonly page: Page,
    private readonly path: string,
  ) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}
