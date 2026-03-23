import type { Locator, Page } from '@playwright/test';
import { PlaygroundBasePage } from './playground-base.page';

export class DynamicIdPage extends PlaygroundBasePage {
  readonly dynamicIdButton: Locator;

  constructor(page: Page) {
    super(page, '/dynamicid');
    this.dynamicIdButton = page.getByRole('button', { name: 'Button with Dynamic ID' });
  }
}

export class TextInputPage extends PlaygroundBasePage {
  readonly buttonNameInput: Locator;
  readonly updatingButton: Locator;

  constructor(page: Page) {
    super(page, '/textinput');

    this.buttonNameInput = page.locator('#newButtonName');
    this.updatingButton = page.locator('#updatingButton');
  }
}

export class ClickPage extends PlaygroundBasePage {
  readonly clickButton: Locator;

  constructor(page: Page) {
    super(page, '/click');
    this.clickButton = page.locator('#badButton');
  }
}

export class GeolocationPage extends PlaygroundBasePage {
  readonly requestLocationButton: Locator;
  readonly locationValue: Locator;

  constructor(page: Page) {
    super(page, '/geolocation');

    this.requestLocationButton = page.locator('#requestLocation');
    this.locationValue = page.locator('#location');
  }
}
