import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BlockSignal OKC/);
  });

  test('displays hero section with search', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Know what changed on your block');
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test('displays stats section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Tracked Projects')).toBeVisible();
    await expect(page.locator('text=Total Changes')).toBeVisible();
    await expect(page.locator('text=Active Sources')).toBeVisible();
  });

  test('displays recent changes section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2:has-text("Recent Changes")')).toBeVisible();
  });

  test('displays featured projects section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2:has-text("Featured Projects")')).toBeVisible();
  });

  test('displays disclaimer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=not affiliated with or endorsed by the City of Oklahoma City')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
    await page.click('a[href="/changes"]');
    await expect(page).toHaveURL(/\/changes/);
    await page.click('a[href="/sources"]');
    await expect(page).toHaveURL(/\/sources/);
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe('Projects Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveTitle(/Projects/);
  });

  test('displays search and filters', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('input[type="search"]')).toBeVisible();
    await expect(page.locator('label:has-text("Status")')).toBeVisible();
    await expect(page.locator('label:has-text("Project Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Source")')).toBeVisible();
  });

  test('search filters projects', async ({ page }) => {
    await page.goto('/projects');
    await page.fill('input[type="search"]', 'expressway');
    await page.waitForTimeout(500);
  });

  test('pagination works', async ({ page }) => {
    await page.goto('/projects');
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });
});

test.describe('Changes Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/changes');
    await expect(page).toHaveTitle(/Changes/);
  });

  test('displays change feed', async ({ page }) => {
    await page.goto('/changes');
    await expect(page.locator('h1:has-text("Changes")')).toBeVisible();
  });

  test('pagination works', async ({ page }) => {
    await page.goto('/changes');
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });
});

test.describe('Sources Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/sources');
    await expect(page).toHaveTitle(/Sources/);
  });

  test('displays source cards', async ({ page }) => {
    await page.goto('/sources');
    await expect(page.locator('h1:has-text("Data Sources")')).toBeVisible();
  });
});

test.describe('About Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/About/);
  });

  test('displays methodology sections', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h2:has-text("Problem Statement")')).toBeVisible();
    await expect(page.locator('h2:has-text("Data Collection")')).toBeVisible();
    await expect(page.locator('h2:has-text("Change Detection")')).toBeVisible();
    await expect(page.locator('h2:has-text("Independence Statement")')).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test('homepage works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Know what changed on your block');
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test('projects page works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/projects');
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test('mobile navigation menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('nav a[href="/projects"]')).toBeVisible();
    await page.click('nav a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });
});

test.describe('Accessibility', () => {
  test('homepage has proper heading structure', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('search input has accessible label', async ({ page }) => {
    await page.goto('/projects');
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search projects');
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.locator('button[type="submit"]');
    await expect(searchButton).toContainText('Search Projects');
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('a[href]');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Error Handling', () => {
  test('handles 404 for unknown project', async ({ page }) => {
    await page.goto('/projects/non-existent-project');
    await expect(page.locator('text=Project not found')).toBeVisible();
  });

  test('handles network gracefully', async ({ page }) => {
    await page.route('/api/projects', route => route.abort());
    await page.goto('/projects');
    await expect(page.locator('text=Failed to load projects')).toBeVisible();
  });
});