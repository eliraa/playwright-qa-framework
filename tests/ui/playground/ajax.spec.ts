import { expect, test } from '@playwright/test';
import { AjaxPage } from '../../../src/pages/playground/async.page';

test.describe('AJAX requests', () => {
  test('waits for the server response and validates the loaded message', async ({ page }) => {
    const ajaxPage = new AjaxPage(page);

    await ajaxPage.open();

    const ajaxResponse = ajaxPage.waitForAjaxDataResponse();

    await ajaxPage.triggerButton.click();
    await ajaxResponse;

    await expect(ajaxPage.successMessage).toHaveText('Data loaded with AJAX get request.', {
      timeout: 20_000,
    });
  });
});
