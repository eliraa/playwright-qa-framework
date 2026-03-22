import { expect, test } from '@playwright/test';
import { UiTestingPlaygroundPageManager } from '../page-objects/ui-testing-playground/uiTestingPlaygroundPageManager';

test.describe('Auto waiting', () => {
  test('waits for the target input to become interactable on the auto-wait page', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.autoWait.open();
    await playground.autoWait.configureTargetAs('input');
    await playground.autoWait.enableAllInteractiveStates();
    await playground.autoWait.applyDelay(3);
    await playground.autoWait.target.fill('Playwright auto-waits for me');

    await expect(playground.autoWait.target).toHaveValue('Playwright auto-waits for me');
  });

  test('waits for the moving target to become stable before clicking it', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.animation.open();
    await playground.animation.startAnimationButton.click();
    await playground.animation.movingTargetButton.click();

    await expect(playground.animation.statusMessage).toContainText('Moving Target clicked.');
    await expect(playground.animation.statusMessage).not.toContainText('spin');
  });
});

test.describe('Load delays', () => {
  test('waits for delayed content to appear after navigation', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.loadDelay.open();

    await expect(playground.loadDelay.delayedButton).toBeVisible({ timeout: 20_000 });
    await playground.loadDelay.delayedButton.click();
    await expect(playground.loadDelay.delayedButton).toBeVisible();
  });

  test('stops the progress bar close to 75 percent without hard waits', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.progressBar.open();
    await playground.progressBar.startButton.click();
    await playground.progressBar.waitForValueAtLeast(75);
    await playground.progressBar.stopButton.click();

    const stoppedValue = Number(await playground.progressBar.progressBar.getAttribute('aria-valuenow'));

    expect(stoppedValue).toBeGreaterThanOrEqual(75);
    expect(stoppedValue).toBeLessThanOrEqual(80);
    await expect(playground.progressBar.result).toContainText('Result:');
  });
});
