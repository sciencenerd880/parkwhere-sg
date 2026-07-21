import { test, expect, Page } from '@playwright/test';

async function searchDestination(page: Page) {
  const searchInput = page.getByPlaceholder('Where you going ah?').locator('visible=true');
  await searchInput.fill('764675');

  const firstResult = page.locator('button.w-full.flex.items-center.gap-3:visible').first();
  await firstResult.waitFor({ state: 'visible' });
  await firstResult.click();
}

test.describe('Destination marker visibility', () => {
  test('carpark markers should be positioned on the map, not clustered at (0,0)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

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
    await searchDestination(page);

    await page.waitForTimeout(2000);

    const marker = page.locator('.maplibregl-marker svg[fill="white"]').first();
    await marker.waitFor({ state: 'visible' });
    const markerBox = await marker.boundingBox();
    expect(markerBox).not.toBeNull();

    const container = page.locator('[data-testid="carpark-panel"]:visible');
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
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await searchDestination(page);

    await page.waitForTimeout(2000);

    const marker = page.locator('.maplibregl-marker svg[fill="white"]').first();
    await marker.waitFor({ state: 'visible' });
    const markerBox = await marker.boundingBox();
    expect(markerBox).not.toBeNull();

    const container = page.locator('[data-testid="carpark-panel"]:visible');
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
});

test.describe('Carpark markers', () => {
  test('markers should be circular pills', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

    await page.waitForTimeout(4000);

    const shapes = await page.evaluate(() => {
      const markers = [...document.querySelectorAll('.maplibregl-marker')].filter(
        (m) => m.querySelector('.marker-label'),
      );
      return markers.map((m) => {
        const r = m.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });
    });

    expect(shapes.length).toBeGreaterThan(0);
    shapes.forEach((s) => {
      expect(Math.abs(s.w - s.h)).toBeLessThanOrEqual(2);
    });
  });
});

test.describe('Favourites', () => {
  test('heart toggle in detail card adds and removes favourite', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();

    const heartBtn = page.locator('button[aria-label="Save carpark"]:visible');
    await heartBtn.waitFor({ state: 'visible' });

    const heartSvg = heartBtn.locator('svg');

    await heartBtn.click();
    await expect(heartSvg).toHaveClass(/fill-current/);

    await heartBtn.click();
    await expect(heartSvg).not.toHaveClass(/fill-current/);
  });

  test('desktop shows saved carparks after clearing destination', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    const address = await firstRow.evaluate((el) =>
      el.querySelector('h3')?.textContent?.trim(),
    );
    await firstRow.click();

    const heartBtn = page.locator('button[aria-label="Save carpark"]:visible');
    await heartBtn.waitFor({ state: 'visible' });
    await heartBtn.click();

    const clearBtn = page.locator(
      '[data-testid="carpark-panel"]:visible button:has-text("Clear")',
    );
    await clearBtn.click();

    const sidebar = page.locator('aside');
    await expect(sidebar.getByText(/saved carpark/i)).toBeVisible();
    if (address) {
      await expect(sidebar.getByText(address).first()).toBeVisible();
    }
  });

  test('mobile shows saved carparks card after clearing destination', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();

    const heartBtn = page.locator('button[aria-label="Save carpark"]:visible');
    await heartBtn.waitFor({ state: 'visible' });
    await heartBtn.click();

    const expandBtn = page.locator('[data-testid="carpark-panel"]:visible').getByText('See all');
    await expandBtn.click();

    const clearBtn = page.locator(
      '[data-testid="carpark-panel"]:visible button:has-text("Clear")',
    );
    await clearBtn.click();

    await expect(page.getByText(/saved carpark/i).locator('visible=true')).toBeVisible();
  });

  test('tapping a favourite card sets destination and loads carparks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    const address = await firstRow.evaluate((el) =>
      el.querySelector('h3')?.textContent?.trim(),
    );
    await firstRow.click();

    const heartBtn = page.locator('button[aria-label="Save carpark"]:visible');
    await heartBtn.waitFor({ state: 'visible' });
    await heartBtn.click();

    const clearBtn = page.locator(
      '[data-testid="carpark-panel"]:visible button:has-text("Clear")',
    );
    await clearBtn.click();

    const savedCard = page.locator('aside button.w-full.text-left').first();
    await savedCard.waitFor({ state: 'visible' });
    await savedCard.click();

    await page.waitForTimeout(3000);

    const panel = page.locator('[data-testid="carpark-panel"]:visible');
    await expect(panel).toBeVisible();

    if (address) {
      await expect(panel.getByText(address).first()).toBeVisible();
    }
  });
});

test.describe('Sidebar and detail card', () => {
  test('desktop sidebar should show empty state before search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(
      page.getByText(/chope you a lot nearby/i),
    ).toBeVisible();
  });

  test('clicking a carpark row should show detail card with Navigate CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();

    const panel = page.locator('[data-testid="carpark-panel"]:visible');
    await expect(panel.getByText('Navigate Here')).toBeVisible();
    await expect(panel.getByText(/Selected Car Park/i)).toBeVisible();
  });
});

test.describe('Mobile peek and expand flow', () => {
  test('selecting a carpark on mobile should collapse drawer to peek height', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    await firstRow.click();
    await page.waitForTimeout(600);

    const panelBox = await page.locator('[data-testid="carpark-panel"]:visible').boundingBox();
    expect(panelBox).not.toBeNull();
    const vh = 812;
    expect(panelBox!.height).toBeLessThan(vh * 0.42);
  });

  test('expanding drawer shows sticky detail card and excludes selected row', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await searchDestination(page);

    const firstRow = page
      .locator('[data-testid="carpark-panel"]:visible button.w-full.text-left')
      .first();
    await firstRow.waitFor({ state: 'visible' });
    const addr = await firstRow.evaluate((el) =>
      el.querySelector('h3')?.textContent?.trim(),
    );
    await firstRow.click();

    const expandBtn = page.locator('[data-testid="carpark-panel"]:visible').getByText('See all');
    await expandBtn.click();
    await page.waitForTimeout(600);

    const panel = page.locator('[data-testid="carpark-panel"]:visible');
    await expect(panel.getByText('Navigate Here')).toBeVisible();

    const occurrences = await panel.locator(`text=${addr}`).count();
    expect(occurrences).toBe(1);

    const listArea = panel.locator('.overflow-y-auto').first();
    await listArea.evaluate((el) => el.scrollTo({ top: 300 }));
    await page.waitForTimeout(300);
    const detailBox = await panel.locator('h2').first().boundingBox();
    expect(detailBox).not.toBeNull();
    expect(detailBox!.y).toBeGreaterThan(0);
    expect(detailBox!.y).toBeLessThan(500);
  });
});
