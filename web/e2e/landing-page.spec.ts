import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Supply Chain Tracker Landing Page
 *
 * These tests verify the basic UI elements and user flows
 * without requiring MetaMask connection
 */

test.describe('Landing Page', () => {
  test('should display the landing page correctly', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check that the page contains "Supply Chain Tracker" text
    await expect(page.locator('text=Supply Chain Tracker')).toBeVisible();
  });

  test('should show connect wallet button when not connected', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that "Connect" or "MetaMask" button is visible
    // The exact text depends on the implementation
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i });
    await expect(connectButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display project description', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Check that the page has some descriptive content
    // Looking for keywords that should be in the landing page
    const pageContent = page.locator('body');
    await expect(pageContent).toContainText(/blockchain|supply chain|trazabilidad/i);
  });

  test('should have proper page title', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Check that the page title is set correctly
    await expect(page).toHaveTitle(/Supply Chain|Tracker/i);
  });
});

/**
 * Note: For MetaMask integration tests, use Synpress
 *
 * Example structure:
 *
 * import { testWithSynpress } from '@synthetixio/synpress';
 * import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
 *
 * const test = testWithSynpress(metaMaskFixtures(basicSetup));
 *
 * test('should connect wallet and register user', async ({ page, metamask }) => {
 *   await page.goto('/');
 *   await page.click('button:has-text("Connect MetaMask")');
 *   await metamask.connectToDapp();
 *   // ... rest of the test
 * });
 */
