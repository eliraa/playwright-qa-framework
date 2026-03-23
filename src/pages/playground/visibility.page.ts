import type { Locator, Page } from '@playwright/test';
import { PlaygroundBasePage } from './playground-base.page';

export class VisibilityPage extends PlaygroundBasePage {
  readonly hideButton: Locator;
  readonly removedButton: Locator;
  readonly zeroWidthButton: Locator;
  readonly overlappedButton: Locator;
  readonly transparentButton: Locator;
  readonly invisibleButton: Locator;
  readonly displayNoneButton: Locator;
  readonly offscreenButton: Locator;

  constructor(page: Page) {
    super(page, '/visibility');

    this.hideButton = page.locator('#hideButton');
    this.removedButton = page.locator('#removedButton');
    this.zeroWidthButton = page.locator('#zeroWidthButton');
    this.overlappedButton = page.locator('#overlappedButton');
    this.transparentButton = page.locator('#transparentButton');
    this.invisibleButton = page.locator('#invisibleButton');
    this.displayNoneButton = page.locator('#notdisplayedButton');
    this.offscreenButton = page.locator('#offscreenButton');
  }
}

export class HiddenLayersPage extends PlaygroundBasePage {
  readonly greenButton: Locator;
  readonly blueButton: Locator;

  constructor(page: Page) {
    super(page, '/hiddenlayers');

    this.greenButton = page.locator('#greenButton');
    this.blueButton = page.locator('#blueButton');
  }
}

export class OverlappedPage extends PlaygroundBasePage {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, '/overlapped');
    this.nameInput = page.locator('#name');
  }

  async scrollNameFieldIntoView(): Promise<void> {
    await this.nameInput.evaluate((element) => {
      const scrollContainer = element.parentElement;

      if (!scrollContainer) {
        throw new Error('Expected the overlapped input to have a scrollable parent container.');
      }

      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });
  }
}
