import { test, expect } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';

/**
 * Complete Supply Chain Flow E2E Test
 *
 * This test covers the entire flow of a product through the supply chain:
 * 1. Admin approves all users (Producer, Factory, Retailer, Consumer)
 * 2. Producer creates raw material token
 * 3. Producer transfers to Factory
 * 4. Factory accepts transfer
 * 5. Factory creates derived product
 * 6. Factory transfers to Retailer
 * 7. Retailer accepts transfer
 * 8. Retailer transfers to Consumer
 * 9. Consumer accepts transfer
 * 10. Verify complete traceability
 */

// Anvil test accounts
const ADMIN_SEED = 'test test test test test test test test test test test junk'; // Account #0
const PRODUCER_SEED = 'test test test test test test test test test test test seed1'; // Account #1
const FACTORY_SEED = 'test test test test test test test test test test test seed2'; // Account #2
const RETAILER_SEED = 'test test test test test test test test test test test seed3'; // Account #3
const CONSUMER_SEED = 'test test test test test test test test test test test seed4'; // Account #4

const METAMASK_PASSWORD = 'Tester@1234';

// Create separate test instances for each role
const adminTest = testWithSynpress(metaMaskFixtures({
  seed: ADMIN_SEED,
  password: METAMASK_PASSWORD,
}));

const producerTest = testWithSynpress(metaMaskFixtures({
  seed: PRODUCER_SEED,
  password: METAMASK_PASSWORD,
}));

const factoryTest = testWithSynpress(metaMaskFixtures({
  seed: FACTORY_SEED,
  password: METAMASK_PASSWORD,
}));

const retailerTest = testWithSynpress(metaMaskFixtures({
  seed: RETAILER_SEED,
  password: METAMASK_PASSWORD,
}));

const consumerTest = testWithSynpress(metaMaskFixtures({
  seed: CONSUMER_SEED,
  password: METAMASK_PASSWORD,
}));

// Helper to configure MetaMask for Anvil
async function setupMetaMask(metamask: MetaMask) {
  await metamask.addNetwork({
    name: 'Anvil Local',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 31337,
    symbol: 'ETH',
  });
}

// Helper to connect wallet
async function connectWallet(page: any, metamask: MetaMask) {
  await page.goto('/');
  await page.click('button:has-text("Connect MetaMask")');
  await metamask.connectToDapp();
  await page.waitForTimeout(2000);
}

// Helper to register user with role
async function registerUser(page: any, metamask: MetaMask, role: string) {
  await page.goto('/');
  await connectWallet(page, metamask);

  // Select role
  await page.click(`button:has-text("${role}")`);
  await page.waitForTimeout(1000);

  // Submit registration
  await page.click('button:has-text("Request Role")');

  // Confirm MetaMask transaction
  await metamask.confirmTransaction();

  // Wait for success
  await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 15000 });
}

test.describe('Complete Supply Chain Flow', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  // Step 1: Register all users
  producerTest('Producer registers with role', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await registerUser(page, metamask, 'Producer');
  });

  factoryTest('Factory registers with role', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await registerUser(page, metamask, 'Factory');
  });

  retailerTest('Retailer registers with role', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await registerUser(page, metamask, 'Retailer');
  });

  consumerTest('Consumer registers with role', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await registerUser(page, metamask, 'Consumer');
  });

  // Step 2: Admin approves all users
  adminTest('Admin approves all users', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Navigate to admin panel
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);

    // Approve Producer
    await page.locator('button:has-text("Approve")').first().click();
    await metamask.confirmTransaction();
    await page.waitForTimeout(3000);

    // Approve Factory
    await page.locator('button:has-text("Approve")').first().click();
    await metamask.confirmTransaction();
    await page.waitForTimeout(3000);

    // Approve Retailer
    await page.locator('button:has-text("Approve")').first().click();
    await metamask.confirmTransaction();
    await page.waitForTimeout(3000);

    // Approve Consumer
    await page.locator('button:has-text("Approve")').first().click();
    await metamask.confirmTransaction();
    await page.waitForTimeout(3000);

    // Verify all approved
    await expect(page.locator('text=Approved')).toHaveCount(4);
  });

  // Step 3: Producer creates raw material token
  producerTest('Producer creates raw material token', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Navigate to create token
    await page.goto('/tokens/create');
    await page.waitForTimeout(2000);

    // Fill token form
    await page.fill('input[name="name"]', 'Organic Wheat');
    await page.fill('input[name="totalSupply"]', '1000');
    await page.fill('textarea[name="features"]', JSON.stringify({
      origin: 'Spain',
      organic: true,
      harvestDate: '2025-10-01'
    }));

    // Submit
    await page.click('button:has-text("Create Token")');
    await metamask.confirmTransaction();

    // Wait for success
    await expect(page.locator('text=Token created successfully')).toBeVisible({ timeout: 15000 });
  });

  // Step 4: Producer transfers to Factory
  producerTest('Producer transfers token to Factory', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to tokens list
    await page.goto('/tokens');
    await page.waitForTimeout(2000);

    // Click on first token
    await page.click('text=Organic Wheat');
    await page.waitForTimeout(1000);

    // Click transfer button
    await page.click('button:has-text("Transfer Token")');
    await page.waitForTimeout(1000);

    // Select Factory from dropdown
    await page.selectOption('select#recipient', { index: 1 }); // First Factory user

    // Enter amount
    await page.fill('input[name="amount"]', '500');

    // Submit transfer
    await page.click('button[type="submit"]:has-text("Transfer")');
    await metamask.confirmTransaction();

    // Wait for success
    await expect(page.locator('text=Transfer initiated successfully')).toBeVisible({ timeout: 15000 });
  });

  // Step 5: Factory accepts transfer
  factoryTest('Factory accepts transfer from Producer', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to transfers
    await page.goto('/transfers');
    await page.waitForTimeout(2000);

    // Click Accept on first pending transfer
    await page.click('button:has-text("Accept")');
    await metamask.confirmTransaction();

    // Wait for success
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Accepted')).toBeVisible();
  });

  // Step 6: Factory creates derived product
  factoryTest('Factory creates derived product', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Navigate to create token
    await page.goto('/tokens/create');
    await page.waitForTimeout(2000);

    // Fill token form
    await page.fill('input[name="name"]', 'Wheat Flour');
    await page.fill('input[name="totalSupply"]', '800');
    await page.fill('textarea[name="features"]', JSON.stringify({
      processedDate: '2025-10-05',
      quality: 'Premium',
      type: 'Whole Wheat Flour'
    }));

    // Parent token should be auto-selected (Organic Wheat)
    // Just verify it's selected
    const selectedValue = await page.inputValue('select#parentId');
    expect(selectedValue).not.toBe('0');

    // Submit
    await page.click('button:has-text("Create Token")');
    await metamask.confirmTransaction();

    // Wait for success
    await expect(page.locator('text=Token created successfully')).toBeVisible({ timeout: 15000 });
  });

  // Step 7: Factory transfers to Retailer
  factoryTest('Factory transfers product to Retailer', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to tokens list
    await page.goto('/tokens');
    await page.waitForTimeout(2000);

    // Click on Wheat Flour token
    await page.click('text=Wheat Flour');
    await page.waitForTimeout(1000);

    // Click transfer button
    await page.click('button:has-text("Transfer Token")');
    await page.waitForTimeout(1000);

    // Select Retailer from dropdown
    await page.selectOption('select#recipient', { index: 1 }); // First Retailer user

    // Enter amount
    await page.fill('input[name="amount"]', '400');

    // Submit transfer
    await page.click('button[type="submit"]:has-text("Transfer")');
    await metamask.confirmTransaction();

    // Wait for success
    await expect(page.locator('text=Transfer initiated successfully')).toBeVisible({ timeout: 15000 });
  });

  // Step 8: Retailer accepts transfer
  retailerTest('Retailer accepts transfer from Factory', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to transfers
    await page.goto('/transfers');
    await page.waitForTimeout(2000);

    // Click Accept on first pending transfer
    await page.click('button:has-text("Accept")');
    await metamask.confirmTransaction();

    // Wait for success
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Accepted')).toBeVisible();
  });

  // Step 9: Retailer transfers to Consumer
  retailerTest('Retailer transfers product to Consumer', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to tokens list
    await page.goto('/tokens');
    await page.waitForTimeout(2000);

    // Click on Wheat Flour token
    await page.click('text=Wheat Flour');
    await page.waitForTimeout(1000);

    // Click transfer button
    await page.click('button:has-text("Transfer Token")');
    await page.waitForTimeout(1000);

    // Select Consumer from dropdown
    await page.selectOption('select#recipient', { index: 1 }); // First Consumer user

    // Enter amount
    await page.fill('input[name="amount"]', '200');

    // Submit transfer
    await page.click('button[type="submit"]:has-text("Transfer")');
    await metamask.confirmTransaction();

    // Wait for success
    await expect(page.locator('text=Transfer initiated successfully')).toBeVisible({ timeout: 15000 });
  });

  // Step 10: Consumer accepts transfer
  consumerTest('Consumer accepts transfer from Retailer', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to transfers
    await page.goto('/transfers');
    await page.waitForTimeout(2000);

    // Click Accept on first pending transfer
    await page.click('button:has-text("Accept")');
    await metamask.confirmTransaction();

    // Wait for success
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Accepted')).toBeVisible();
  });

  // Step 11: Verify complete traceability
  consumerTest('Consumer can trace product back to origin', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    // Go to tokens
    await page.goto('/tokens');
    await page.waitForTimeout(2000);

    // Verify Consumer has the token
    await expect(page.locator('text=Wheat Flour')).toBeVisible();

    // Click on token to see details
    await page.click('text=Wheat Flour');
    await page.waitForTimeout(1000);

    // Verify token details
    await expect(page.locator('text=Wheat Flour')).toBeVisible();
    await expect(page.locator('text=Balance')).toBeVisible();
    await expect(page.locator('text=200')).toBeVisible(); // Balance received

    // Verify parent token link exists
    await expect(page.locator('text=Parent Token')).toBeVisible();

    // Click parent token to trace back
    const parentLink = page.locator('a:has-text("#1")'); // Organic Wheat should be token #1
    if (await parentLink.isVisible()) {
      await parentLink.click();
      await page.waitForTimeout(1000);

      // Verify we're seeing the original raw material
      await expect(page.locator('text=Organic Wheat')).toBeVisible();
      await expect(page.locator('text=Raw Material')).toBeVisible();
    }
  });

  // Step 12: Verify all transfers history
  producerTest('Producer can see outgoing transfer history', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    await page.goto('/transfers');
    await page.waitForTimeout(2000);

    // Filter to outgoing
    await page.click('button:has-text("Outgoing")');
    await page.waitForTimeout(1000);

    // Verify transfer exists and is accepted
    await expect(page.locator('text=Accepted')).toBeVisible();
    await expect(page.locator('text=500')).toBeVisible(); // Amount transferred
  });

  factoryTest('Factory can see both incoming and outgoing transfers', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    await page.goto('/transfers');
    await page.waitForTimeout(2000);

    // Check incoming
    await page.click('button:has-text("Incoming")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Accepted')).toBeVisible();

    // Check outgoing
    await page.click('button:has-text("Outgoing")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Accepted')).toBeVisible();
  });

  // Step 13: Verify dashboard stats
  producerTest('Producer dashboard shows correct statistics', async ({ page, metamask }) => {
    await setupMetaMask(metamask);
    await connectWallet(page, metamask);

    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Verify stats are displayed
    await expect(page.locator('text=My Tokens')).toBeVisible();
    await expect(page.locator('text=Total Transfers')).toBeVisible();
  });
});
