import { test, expect } from '@playwright/test';

test.describe('Destination marker visibility', () => {
  test('desktop panel should not obscure marker', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const searchInput = page.getByPlaceholder('Where you going ah?');
    await searchInput.fill('764675');
    
    const firstResult = page.locator('button.w-full.flex.items-center.gap-3').first();
    await firstResult.waitFor({ state: 'visible' });
    await firstResult.click();

    await page.waitForTimeout(2000);

    const marker = page.locator('.maplibregl-marker svg[fill="white"]').first();
    await marker.waitFor({ state: 'visible' });
    const markerBox = await marker.boundingBox();
    expect(markerBox).not.toBeNull();

    const container = page.locator('[data-testid="carpark-panel"]');
    if (await container.isVisible()) {
      const panelBox = await container.boundingBox();
      if (panelBox && markerBox) {
        const isOverlapping = 
          markerBox.x < panelBox.x + panelBox.width &&
          markerBox.x + markerBox.width > panelBox.x &&
          markerBox.y < panelBox.y + panelBox.height &&
          markerBox.y + markerBox.height > panelBox.y;
          
        expect(isOverlapping).toBe(false);
      }
    }
  });

  test('mobile bottom sheet should not obscure marker', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const searchInput = page.getByPlaceholder('Where you going ah?');
    await searchInput.fill('764675');
    
    const firstResult = page.locator('button.w-full.flex.items-center.gap-3').first();
    await firstResult.waitFor({ state: 'visible' });
    await firstResult.click();

    await page.waitForTimeout(2000);

    const marker = page.locator('.maplibregl-marker svg[fill="white"]').first();
    await marker.waitFor({ state: 'visible' });
    const markerBox = await marker.boundingBox();
    expect(markerBox).not.toBeNull();

    const container = page.locator('[data-testid="carpark-panel"]');
    if (await container.isVisible()) {
      const panelBox = await container.boundingBox();
      
      console.log('Mobile Marker:', markerBox);
      console.log('Mobile Panel:', panelBox);

      if (panelBox && markerBox) {
        const isOverlapping = 
          markerBox.x < panelBox.x + panelBox.width &&
          markerBox.x + markerBox.width > panelBox.x &&
          markerBox.y < panelBox.y + panelBox.height &&
          markerBox.y + markerBox.height > panelBox.y;
          
        expect(isOverlapping).toBe(false);
      }
    }
  });
});
