import { test, expect } from '@playwright/test';

test('has expected page title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // We'll just check that the page loads properly. Update this to match your actual title!
  await expect(page).toHaveTitle(/ParkWhere/i);
});

test('map container loads', async ({ page }) => {
  await page.goto('/');

  // Check if your app loads its main map or UI container. 
  // MapLibre usually mounts into an element with maplibregl-map class, but adjust this if needed.
  const mapContainer = page.locator('.maplibregl-map').first();
  await expect(mapContainer).toBeVisible({ timeout: 10000 });
});
