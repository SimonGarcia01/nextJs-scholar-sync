import { test, expect } from '@playwright/test';

test('home shows header link', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('text=Scholar Sync')).toBeVisible();
});
