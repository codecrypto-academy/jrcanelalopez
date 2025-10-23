import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import { expect } from '@playwright/test';

/**
 * E2E Test for Auto-Registration Flow with MetaMask
 *
 * Test Flow:
 * 1. User connects MetaMask wallet
 * 2. User selects a role (Producer/Factory/Retailer/Consumer)
 * 3. User submits registration request
 * 4. Transaction is sent via MetaMask
 * 5. User status becomes "Pending"
 *
 * Prerequisites:
 * - Anvil running on localhost:8545
 * - Contract deployed at address in .env.local
 * - MetaMask configured with Anvil network (Chain ID: 31337)
 */

const test = testWithSynpress(metaMaskFixtures({
  seed: 'test test test test test test test test test test test junk',
  password: 'Tester@1234',
}));

const { expect: expectSynpress } = test;

test.describe('Auto-Registration Flow with MetaMask', () => {
  test.beforeEach(async ({ page, metamask }) => {
    // Add Anvil network to MetaMask
    await metamask.addNetwork({
      name: 'Anvil Local',
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      symbol: 'ETH',
    });

    // Switch to Anvil network
    await metamask.switchNetwork('Anvil Local');
  });

  test('should connect wallet successfully', async ({ page, metamask }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Find and click the "Connect MetaMask" button
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();

    // Accept the MetaMask connection
    await metamask.connectToDapp();

    // Verify that wallet address is displayed
    await expectSynpress(page.locator('text=/0x[a-fA-F0-9]{40}/')).toBeVisible({ timeout: 10000 });
  });

  test('should allow user to request Producer role', async ({ page, metamask }) => {
    // Navigate and connect wallet
    await page.goto('/');
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Wait for the registration form to appear
    await page.waitForSelector('text=/producer|factory|retailer|consumer/i', { timeout: 10000 });

    // Select Producer role
    const producerButton = page.locator('button, [role="button"]').filter({ hasText: /producer/i }).first();
    await producerButton.click();

    // Submit the registration form
    const submitButton = page.locator('button').filter({ hasText: /register|submit|request/i }).first();
    await submitButton.click();

    // Confirm the MetaMask transaction
    await metamask.confirmTransaction();

    // Wait for transaction to complete
    await page.waitForTimeout(2000);

    // Verify that status shows "Pending"
    await expectSynpress(page.locator('text=/pending|esperando/i')).toBeVisible({ timeout: 15000 });
  });

  test('should allow user to request Factory role', async ({ page, metamask }) => {
    // Navigate and connect wallet
    await page.goto('/');
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Wait for the registration form
    await page.waitForSelector('text=/producer|factory|retailer|consumer/i', { timeout: 10000 });

    // Select Factory role
    const factoryButton = page.locator('button, [role="button"]').filter({ hasText: /factory|fábrica/i }).first();
    await factoryButton.click();

    // Submit
    const submitButton = page.locator('button').filter({ hasText: /register|submit|request/i }).first();
    await submitButton.click();

    // Confirm transaction
    await metamask.confirmTransaction();

    // Verify pending status
    await page.waitForTimeout(2000);
    await expectSynpress(page.locator('text=/pending|esperando/i')).toBeVisible({ timeout: 15000 });
  });

  test('should allow user to request Retailer role', async ({ page, metamask }) => {
    // Navigate and connect wallet
    await page.goto('/');
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Wait for the registration form
    await page.waitForSelector('text=/producer|factory|retailer|consumer/i', { timeout: 10000 });

    // Select Retailer role
    const retailerButton = page.locator('button, [role="button"]').filter({ hasText: /retailer|minorista/i }).first();
    await retailerButton.click();

    // Submit
    const submitButton = page.locator('button').filter({ hasText: /register|submit|request/i }).first();
    await submitButton.click();

    // Confirm transaction
    await metamask.confirmTransaction();

    // Verify pending status
    await page.waitForTimeout(2000);
    await expectSynpress(page.locator('text=/pending|esperando/i')).toBeVisible({ timeout: 15000 });
  });

  test('should allow user to request Consumer role', async ({ page, metamask }) => {
    // Navigate and connect wallet
    await page.goto('/');
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Wait for the registration form
    await page.waitForSelector('text=/producer|factory|retailer|consumer/i', { timeout: 10000 });

    // Select Consumer role
    const consumerButton = page.locator('button, [role="button"]').filter({ hasText: /consumer|consumidor/i }).first();
    await consumerButton.click();

    // Submit
    const submitButton = page.locator('button').filter({ hasText: /register|submit|request/i }).first();
    await submitButton.click();

    // Confirm transaction
    await metamask.confirmTransaction();

    // Verify pending status
    await page.waitForTimeout(2000);
    await expectSynpress(page.locator('text=/pending|esperando/i')).toBeVisible({ timeout: 15000 });
  });

  test('should display error if user rejects transaction', async ({ page, metamask }) => {
    // Navigate and connect wallet
    await page.goto('/');
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Select a role
    await page.waitForSelector('text=/producer|factory|retailer|consumer/i', { timeout: 10000 });
    const producerButton = page.locator('button, [role="button"]').filter({ hasText: /producer/i }).first();
    await producerButton.click();

    // Submit
    const submitButton = page.locator('button').filter({ hasText: /register|submit|request/i }).first();
    await submitButton.click();

    // Reject the transaction
    await metamask.rejectTransaction();

    // Wait a bit
    await page.waitForTimeout(1000);

    // Verify that an error message is shown
    await expectSynpress(page.locator('text=/error|rejected|rechazado|cancelado/i')).toBeVisible({ timeout: 10000 });
  });
});

/**
 * Setup Instructions:
 *
 * 1. Install browsers for Playwright:
 *    npx playwright install --with-deps chromium
 *
 * 2. Ensure Anvil is running:
 *    anvil
 *
 * 3. Deploy the contract:
 *    cd ../sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
 *
 * 4. Run the tests:
 *    npx playwright test e2e/auto-registration.spec.ts
 *
 * 5. View the report:
 *    npx playwright show-report
 *
 * Note: Synpress will automatically set up MetaMask with the provided seed phrase
 * and password. The tests will run with a fresh MetaMask instance each time.
 */
