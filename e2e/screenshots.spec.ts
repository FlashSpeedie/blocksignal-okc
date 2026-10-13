import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
  });

  test('homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/home.png', fullPage: true });
  });

  test('projects page', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/projects.png', fullPage: true });
  });

  test('changes page', async ({ page }) => {
    await page.goto(`${BASE_URL}/changes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/changes.png', fullPage: true });
  });

  test('sources page', async ({ page }) => {
    await page.goto(`${BASE_URL}/sources`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/sources.png', fullPage: true });
  });

  test('about page', async ({ page }) => {
    await page.goto(`${BASE_URL}/about`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/about.png', fullPage: true });
  });

  test('mobile homepage', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
  });

  test('project detail page (if available)', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const projectLink = page.locator('a[href^="/projects/"]').first();
    if (await projectLink.count() > 0) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'docs/screenshots/project-detail.png', fullPage: true });
    }
  });
});