import { expect, test } from '@playwright/test';
import { UiTestingPlaygroundPageManager } from '../page-objects/ui-testing-playground/uiTestingPlaygroundPageManager';

test.describe('Visibility states', () => {
  test('distinguishes removed, hidden and still-visible buttons after clicking Hide', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.visibility.open();
    await playground.visibility.hideButton.click();

    await expect(playground.visibility.removedButton).toHaveCount(0);
    await expect(playground.visibility.zeroWidthButton).not.toBeVisible();
    await expect(playground.visibility.invisibleButton).not.toBeVisible();
    await expect(playground.visibility.displayNoneButton).not.toBeVisible();
    await expect(playground.visibility.overlappedButton).toBeVisible();
    await expect(playground.visibility.transparentButton).toBeVisible();
    await expect(playground.visibility.offscreenButton).toBeVisible();
  });
});

test.describe('Hidden and overlapped elements', () => {
  test('reveals the next clickable layer only after the first button is pressed', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.hiddenLayers.open();
    await expect(playground.hiddenLayers.blueButton).toBeHidden();

    await playground.hiddenLayers.greenButton.click();

    await expect(playground.hiddenLayers.blueButton).toBeVisible();
  });

  test('scrolls the overlapped field into view before entering text', async ({ page }) => {
    const playground = new UiTestingPlaygroundPageManager(page);

    await playground.overlapped.open();
    await playground.overlapped.scrollNameFieldIntoView();
    await playground.overlapped.nameInput.fill('Playwright User');

    await expect(playground.overlapped.nameInput).toHaveValue('Playwright User');
  });
});
