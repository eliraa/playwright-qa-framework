import { expect, test } from '@playwright/test';
import { PlaygroundPageManager } from '../../../src/pages/playground/playground.page-manager';

test.describe('Dynamic elements', () => {
  test('finds the button by stable text instead of its changing id', async ({ page }) => {
    const playground = new PlaygroundPageManager(page);

    await playground.dynamicId.open();
    const firstId = await playground.dynamicId.dynamicIdButton.getAttribute('id');

    await page.reload();
    const secondId = await playground.dynamicId.dynamicIdButton.getAttribute('id');

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    await expect(playground.dynamicId.dynamicIdButton).toBeVisible();
  });
});

test.describe('Text input', () => {
  test('updates the button label with the entered value', async ({ page }) => {
    const playground = new PlaygroundPageManager(page);
    const updatedLabel = 'Playwright Rocks';

    await playground.textInput.open();
    await playground.textInput.buttonNameInput.fill(updatedLabel);
    await playground.textInput.updatingButton.click();

    await expect(playground.textInput.updatingButton).toHaveText(updatedLabel);
  });
});

test.describe('Buttons and clicks', () => {
  test('verifies the button changes state after a successful click', async ({ page }) => {
    const playground = new PlaygroundPageManager(page);

    await playground.click.open();
    await expect(playground.click.clickButton).toHaveClass(/btn-primary/);

    await playground.click.clickButton.click();

    await expect(playground.click.clickButton).toHaveClass(/btn-success/);
  });
});
