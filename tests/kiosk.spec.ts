import { test, expect } from '@playwright/test';
// Fix: Use ESM import for the test matrix defined in utils/testMatrix.ts instead of require() which is not defined in this scope
import { TOP_VIEWPORTS } from '../utils/testMatrix';

for (const vp of TOP_VIEWPORTS) {
  test(`Viewport ${vp.name} (${vp.width}x${vp.height}) should have no vertical scroll`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    
    // Check main document
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > window.innerHeight + 1;
    });
    
    expect(isScrollable).toBe(false);
    
    // Verify critical elements are visible
    await expect(page.locator('input')).toBeVisible();
    await expect(page.locator('button:has-text("ПРОВЕРИТЬ")')).toBeInViewport();
  });
}
