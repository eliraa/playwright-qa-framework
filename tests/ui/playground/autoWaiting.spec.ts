import { expect, test } from '@playwright/test';
import { ProgressBarPage } from '../../../src/pages/playground/async.page';

const targetProgressValue = 75;
const allowedProgressOvershoot = 10;

test.describe('Synchronization examples', () => {
  test('stops the progress bar close to 75 percent without hard waits', async ({ page }) => {
    const progressBarPage = new ProgressBarPage(page);

    await progressBarPage.open();
    await progressBarPage.startButton.click();
    await progressBarPage.waitForValueAtLeast(targetProgressValue);
    await progressBarPage.stopButton.click();

    const stoppedValue = Number(await progressBarPage.progressBar.getAttribute('aria-valuenow'));

    // CI load can delay the stop click slightly after the threshold is reached.
    expect(stoppedValue).toBeGreaterThanOrEqual(targetProgressValue);
    expect(stoppedValue).toBeLessThanOrEqual(targetProgressValue + allowedProgressOvershoot);
    await expect(progressBarPage.result).toContainText('Result:');
  });
});
