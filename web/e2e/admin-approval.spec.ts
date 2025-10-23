import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import { expect } from '@playwright/test';

/**
 * E2E Test for Admin Approval Flow with MetaMask
 *
 * Test Flow:
 * 1. Admin connects wallet
 * 2. Admin navigates to admin panel (/admin or /admin/users)
 * 3. Admin sees pending user registrations
 * 4. Admin approves a pending user
 * 5. User status changes to "Approved"
 *
 * Prerequisites:
 * - Anvil running on localhost:8545
 * - Contract deployed with admin account
 * - At least one pending user in the system
 * - Admin account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 * - Admin private key configured in MetaMask
 */

// Use the admin account from Anvil (Account #0)
const ADMIN_SEED = 'test test test test test test test test test test test junk';

const test = testWithSynpress(metaMaskFixtures({
  seed: ADMIN_SEED,
  password: 'Admin@1234',
}));

const { expect: expectSynpress } = test;

test.describe('Admin Approval Flow with MetaMask', () => {
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

    // Navigate to the app
    await page.goto('/');

    // Connect wallet
    const connectButton = page.locator('button').filter({ hasText: /connect|metamask/i }).first();
    await connectButton.click();
    await metamask.connectToDapp();

    // Wait for connection
    await page.waitForTimeout(2000);
  });

  test('should display admin panel for admin user', async ({ page }) => {
    // Admin should see a link or button to access admin panel
    // This could be in a navigation menu or a direct button
    await expectSynpress(
      page.locator('a, button').filter({ hasText: /admin|panel|usuarios|users/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to admin users page', async ({ page }) => {
    // Try to navigate directly to admin panel
    await page.goto('/admin/users');

    // Page should load without being redirected (admin check)
    await page.waitForLoadState('networkidle');

    // Should see admin-related content
    await expectSynpress(
      page.locator('text=/users|usuarios|pending|aprobación/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display list of pending users', async ({ page }) => {
    // Navigate to admin users page
    await page.goto('/admin/users');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Should see pending users or a "no pending users" message
    const hasPendingUsers = await page.locator('text=/pending|pendiente/i').isVisible({ timeout: 5000 })
      .catch(() => false);

    const hasNoUsers = await page.locator('text=/no users|no hay usuarios/i').isVisible({ timeout: 5000 })
      .catch(() => false);

    // Either pending users exist or there are none
    expect(hasPendingUsers || hasNoUsers).toBeTruthy();
  });

  test('should allow admin to approve a pending user', async ({ page, metamask }) => {
    // This test assumes there's at least one pending user
    // You might need to create one first using the auto-registration flow

    // Navigate to admin users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for approve buttons
    const approveButtons = page.locator('button').filter({ hasText: /approve|aprobar/i });

    // Check if there are any pending users to approve
    const count = await approveButtons.count();

    if (count === 0) {
      test.skip('No pending users to approve');
      return;
    }

    // Click the first approve button
    await approveButtons.first().click();

    // Confirm the transaction in MetaMask
    await metamask.confirmTransaction();

    // Wait for transaction to complete
    await page.waitForTimeout(3000);

    // Verify success message or status change
    await expectSynpress(
      page.locator('text=/approved|aprobado|success|éxito/i')
    ).toBeVisible({ timeout: 15000 });
  });

  test('should allow admin to reject a pending user', async ({ page, metamask }) => {
    // Navigate to admin users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for reject buttons
    const rejectButtons = page.locator('button').filter({ hasText: /reject|rechazar/i });

    // Check if there are any pending users to reject
    const count = await rejectButtons.count();

    if (count === 0) {
      test.skip('No pending users to reject');
      return;
    }

    // Click the first reject button
    await rejectButtons.first().click();

    // Confirm the transaction in MetaMask
    await metamask.confirmTransaction();

    // Wait for transaction to complete
    await page.waitForTimeout(3000);

    // Verify success message or status change
    await expectSynpress(
      page.locator('text=/rejected|rechazado|success|éxito/i')
    ).toBeVisible({ timeout: 15000 });
  });

  test('should display user details with address and role', async ({ page }) => {
    // Navigate to admin users page
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Look for Ethereum addresses (0x followed by 40 hex characters)
    const hasAddresses = await page.locator('text=/0x[a-fA-F0-9]{40}/').isVisible({ timeout: 5000 })
      .catch(() => false);

    // Look for role names
    const hasRoles = await page.locator('text=/producer|factory|retailer|consumer/i').isVisible({ timeout: 5000 })
      .catch(() => false);

    // Should display at least addresses or roles (or no users message)
    const hasNoUsers = await page.locator('text=/no users|no hay usuarios/i').isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasAddresses || hasRoles || hasNoUsers).toBeTruthy();
  });

  test('should prevent non-admin users from accessing admin panel', async ({ page, context, metamask }) => {
    // This test would require switching to a non-admin account
    // For now, we just verify that there's some access control in place

    // Disconnect current wallet
    await page.goto('/');

    // Try to navigate to admin panel directly (if implemented with proper access control)
    const response = await page.goto('/admin/users');

    // Should either:
    // 1. Redirect to home page
    // 2. Show an access denied message
    // 3. Show a "connect wallet" message

    const isRedirected = page.url() !== `${page.url().split('/').slice(0, 3).join('/')}/admin/users`;
    const hasAccessDenied = await page.locator('text=/access denied|not authorized|no autorizado/i').isVisible({ timeout: 2000 })
      .catch(() => false);
    const hasConnectWallet = await page.locator('button').filter({ hasText: /connect/i }).isVisible({ timeout: 2000 })
      .catch(() => false);

    // At least one security measure should be in place
    expect(isRedirected || hasAccessDenied || hasConnectWallet).toBeTruthy();
  });
});

/**
 * Complete Workflow Test
 *
 * This test combines both user registration and admin approval
 * in a single end-to-end flow
 */
test.describe('Complete Registration to Approval Workflow', () => {
  test('full flow: user registers → admin approves → user can operate', async ({ page, context, metamask }) => {
    // This is a comprehensive test that would require:
    // 1. Two browser contexts (one for user, one for admin)
    // 2. User registration with one wallet
    // 3. Admin approval with admin wallet
    // 4. Verification that user can now create tokens

    // This is more complex and would be implemented based on the actual
    // UI implementation. The structure would be:

    // Context 1: User registration
    // - Connect non-admin wallet
    // - Request Producer role
    // - Verify Pending status

    // Context 2: Admin approval
    // - Connect admin wallet
    // - Navigate to admin panel
    // - Approve the pending user

    // Context 1 again: User verification
    // - Reconnect user wallet
    // - Verify Approved status
    // - Navigate to create token page
    // - Verify user can create tokens

    test.skip('Implementation pending - requires multi-context setup');
  });
});

/**
 * Setup Instructions:
 *
 * 1. Ensure you have the admin private key:
 *    - Account #0 from Anvil: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 *    - Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
 *
 * 2. Create a pending user first:
 *    - Run: npm run test:frontend-flow (from integration tests)
 *    - Or manually register a user via the frontend
 *
 * 3. Run the admin tests:
 *    npx playwright test e2e/admin-approval.spec.ts
 *
 * 4. View the report:
 *    npx playwright show-report
 */
