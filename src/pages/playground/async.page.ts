import type { Locator, Page } from '@playwright/test';
import { PlaygroundBasePage } from './playground-base.page';

type AutoWaitElementType = 'button' | 'input' | 'textarea' | 'select' | 'label';
type AutoWaitDelay = 3 | 5 | 10;
const progressBarThresholdTimeout = 30_000;

export class AutoWaitPage extends PlaygroundBasePage {
  readonly elementType: Locator;
  readonly visibleCheckbox: Locator;
  readonly enabledCheckbox: Locator;
  readonly editableCheckbox: Locator;
  readonly onTopCheckbox: Locator;
  readonly nonZeroSizeCheckbox: Locator;
  readonly apply3sButton: Locator;
  readonly apply5sButton: Locator;
  readonly apply10sButton: Locator;
  readonly target: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    super(page, '/autowait');

    this.elementType = page.locator('#element-type');
    this.visibleCheckbox = page.locator('#visible');
    this.enabledCheckbox = page.locator('#enabled');
    this.editableCheckbox = page.locator('#editable');
    this.onTopCheckbox = page.locator('#ontop');
    this.nonZeroSizeCheckbox = page.locator('#nonzero');
    this.apply3sButton = page.locator('#applyButton3');
    this.apply5sButton = page.locator('#applyButton5');
    this.apply10sButton = page.locator('#applyButton10');
    this.target = page.locator('#target');
    this.statusMessage = page.locator('#opstatus');
  }

  async configureTargetAs(type: AutoWaitElementType): Promise<void> {
    await this.elementType.selectOption(type);
  }

  async enableAllInteractiveStates(): Promise<void> {
    await this.visibleCheckbox.check();
    await this.enabledCheckbox.check();
    await this.editableCheckbox.check();
    await this.onTopCheckbox.check();
    await this.nonZeroSizeCheckbox.check();
  }

  async applyDelay(seconds: AutoWaitDelay): Promise<void> {
    const delayButtons: Record<AutoWaitDelay, Locator> = {
      3: this.apply3sButton,
      5: this.apply5sButton,
      10: this.apply10sButton,
    };

    await delayButtons[seconds].click();
  }
}

export class AnimationPage extends PlaygroundBasePage {
  readonly startAnimationButton: Locator;
  readonly movingTargetButton: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    super(page, '/animation');

    this.startAnimationButton = page.locator('#animationButton');
    this.movingTargetButton = page.locator('#movingTarget');
    this.statusMessage = page.locator('#opstatus');
  }
}

export class LoadDelayPage extends PlaygroundBasePage {
  readonly delayedButton: Locator;

  constructor(page: Page) {
    super(page, '/loaddelay');
    this.delayedButton = page.getByRole('button', { name: 'Button Appearing After Delay' });
  }
}

export class ProgressBarPage extends PlaygroundBasePage {
  readonly startButton: Locator;
  readonly stopButton: Locator;
  readonly progressBar: Locator;
  readonly result: Locator;

  constructor(page: Page) {
    super(page, '/progressbar');

    this.startButton = page.locator('#startButton');
    this.stopButton = page.locator('#stopButton');
    this.progressBar = page.locator('#progressBar');
    this.result = page.locator('#result');
  }

  async waitForValueAtLeast(
    targetValue: number,
    timeout = progressBarThresholdTimeout,
  ): Promise<void> {
    // Keep the longer timeout scoped to this condition-based wait instead of relaxing
    // the rest of the suite for a single timing-sensitive demo page.
    await this.page.waitForFunction((expectedValue) => {
      const progressBar = document.getElementById('progressBar');
      return Number(progressBar?.getAttribute('aria-valuenow')) >= expectedValue;
    }, targetValue, { timeout });
  }
}

export class AjaxPage extends PlaygroundBasePage {
  readonly triggerButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, '/ajax');

    this.triggerButton = page.getByRole('button', { name: 'Button Triggering AJAX Request' });
    this.successMessage = page.locator('.bg-success');
  }

  async waitForAjaxDataResponse(): Promise<void> {
    await this.page.waitForResponse((response) => {
      return response.url().endsWith('/ajaxdata') && response.ok();
    });
  }
}

export class ClientDelayPage extends PlaygroundBasePage {
  readonly triggerButton: Locator;
  readonly statusMessage: Locator;

  constructor(page: Page) {
    super(page, '/clientdelay');

    this.triggerButton = page.locator('#ajaxButton');
    this.statusMessage = page.getByText('Data calculated on the client side.');
  }
}
