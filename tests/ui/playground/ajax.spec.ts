import { expect, test } from '@playwright/test';
import { PlaygroundPageManager } from '../../../src/pages/playground/playground.page-manager';

test.describe('AJAX requests', () => {
  test('waits for the server response and validates the loaded message', async ({ page }) => {
    const playground = new PlaygroundPageManager(page);

    await playground.ajax.open();

    const ajaxResponse = playground.ajax.waitForAjaxDataResponse();

    await playground.ajax.triggerButton.click();
    await ajaxResponse;

    await expect(playground.ajax.successMessage).toHaveText('Data loaded with AJAX get request.', { timeout: 20_000 });
  });
});

test.describe('Client-side delays', () => {
  test('waits for delayed client-side content without hard sleeps', async ({ page }) => {
    const playground = new PlaygroundPageManager(page);

    await playground.clientDelay.open();
    await playground.clientDelay.triggerButton.click();

    await expect(playground.clientDelay.statusMessage).toBeVisible({ timeout: 20_000 });
  });
});
