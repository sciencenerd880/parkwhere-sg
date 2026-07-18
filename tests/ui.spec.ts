import { test, expect } from '@playwright/test';

test.describe('Destination marker visibility', () => {
  test('carpark markers should be positioned on the map, not clustered at (0,0)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const searchInput = page.getByPlaceholder('Where you going ah?');
    await searchInput.fill('764675');

    const firstResult = page.locator('button.w-full.flex.items-center.gap-3').first();
    await firstResult.waitFor({ state: 'visible' });
    await firstResult.click();

    await page.waitForTimeout(4000);

    const positions = await page.evaluate(() => {
      const markers = [...document.querySelectorAll('.maplibregl-marker')];
      return markers.map((m) => {
        const r = m.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y) };
      });
    });

    expect(positions.length).toBeGreaterThan(1);
    const onMap = positions.filter((p) => p.x > 50 && p.y > 50);
    expect(onMap.length).toBeGreaterThanOrEqual(3);
  });
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
