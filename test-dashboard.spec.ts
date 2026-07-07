import { test, expect } from '@playwright/test';

test('Dashboard Bento View visual check', async ({ page }) => {
  // Pre-seed local storage or mock to bypass login if necessary
  await page.goto('http://localhost:3000/nutrition');

  // Wait for load
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({ path: 'dashboard-bento-view.png', fullPage: true });
});
