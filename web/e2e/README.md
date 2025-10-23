# E2E Testing with Playwright & Synpress

## Overview

This directory contains End-to-End (E2E) tests for the Supply Chain Tracker application using Playwright and Synpress. The tests cover:

- **Basic UI Testing**: Landing page functionality without MetaMask
- **Web3 Integration**: Auto-registration flow with MetaMask using Synpress
- **Admin Workflows**: User approval and rejection flows

## Test Files

### 1. `landing-page.spec.ts`
Basic UI tests that don't require MetaMask connection:
- Landing page rendering
- Connect wallet button visibility
- Page content and title verification
- Basic navigation

**Run with:**
```bash
npm run test:e2e:landing
```

### 2. `auto-registration.spec.ts`
MetaMask integration tests for user registration:
- Wallet connection via MetaMask
- Role selection (Producer, Factory, Retailer, Consumer)
- Transaction submission and confirmation
- Status verification (Pending)
- Transaction rejection handling

**Run with:**
```bash
npm run test:e2e:registration
```

### 3. `admin-approval.spec.ts`
Admin panel tests for user management:
- Admin authentication and access control
- Viewing pending user registrations
- Approving user registrations
- Rejecting user registrations
- User details display

**Run with:**
```bash
npm run test:e2e:admin
```

### 4. `complete-supply-chain-flow.spec.ts` ⭐ **Full End-to-End Test**
Complete supply chain flow testing the entire system from Producer to Consumer:

**Flow Tested:**
1. **User Registration**: All 4 roles register (Producer, Factory, Retailer, Consumer)
2. **Admin Approval**: Admin approves all registered users
3. **Token Creation**: Producer creates raw material token ("Organic Wheat")
4. **First Transfer**: Producer → Factory (500 units)
5. **Transfer Acceptance**: Factory accepts the transfer
6. **Derived Product**: Factory creates derived product ("Wheat Flour" from "Organic Wheat")
7. **Second Transfer**: Factory → Retailer (400 units)
8. **Transfer Acceptance**: Retailer accepts the transfer
9. **Final Transfer**: Retailer → Consumer (200 units)
10. **Transfer Acceptance**: Consumer accepts the transfer
11. **Traceability Verification**: Consumer can trace product back to origin
12. **Transfer History**: All parties can see their transfer history
13. **Dashboard Stats**: All stats are displayed correctly

**What This Test Validates:**
- ✅ Complete user lifecycle (register → approve → operate)
- ✅ Role-based access control (Producer→Factory→Retailer→Consumer)
- ✅ Token creation with parent-child relationships
- ✅ Transfer approval workflow (Pending → Accept/Reject)
- ✅ Balance tracking across all transfers
- ✅ Traceability from consumer back to origin
- ✅ Dashboard and transfer history accuracy
- ✅ Multi-account MetaMask integration with Synpress

**Run with:**
```bash
# Headless (faster)
npm run test:e2e:flow

# Headed mode (see browser actions)
npm run test:e2e:flow:headed
```

**Duration:** ~5-7 minutes (involves multiple MetaMask transactions)

**Note:** This is the most comprehensive test. It validates that the entire supply chain system works end-to-end with real blockchain transactions.

## Prerequisites

### 1. Install Playwright Browsers
```bash
npm run playwright:install
# Or manually:
npx playwright install --with-deps chromium
```

### 2. Start Anvil Blockchain
```bash
# In a separate terminal
anvil
```

This will start a local Ethereum node on `http://localhost:8545` with Chain ID `31337`.

### 3. Deploy the Smart Contract
```bash
# From the project root
cd sc
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### 4. Start the Frontend Development Server
```bash
# In another terminal, from the web directory
npm run dev
```

The app will be available at `http://localhost:3000`.

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

This opens Playwright's UI mode where you can:
- See all tests
- Run tests individually
- Debug with step-by-step execution
- View screenshots and videos

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

This runs tests with the browser visible, useful for debugging.

### Run Specific Test File
```bash
npm run test:e2e:landing        # Landing page tests only
npm run test:e2e:registration   # Auto-registration tests
npm run test:e2e:admin          # Admin approval tests
npm run test:e2e:flow           # Complete supply chain flow (FULL E2E)
npm run test:e2e:flow:headed    # Complete flow with browser visible
```

### View Test Report
After running tests, view the HTML report:
```bash
npm run playwright:report
```

## Synpress Configuration

Synpress is configured to use:
- **Seed Phrase**: `test test test test test test test test test test test junk`
- **Password**: `Tester@1234` (for user tests) / `Admin@1234` (for admin tests)
- **Network**: Anvil Local (Chain ID: 31337)
- **RPC URL**: http://localhost:8545

These settings automatically set up a MetaMask instance for each test.

### Anvil Test Accounts

The tests use the standard Anvil test accounts:

**Admin (Account #0):**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**User Accounts (for testing):**
- Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Account #2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Account #3: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- ... (see Anvil output for complete list)

## Test Structure

### Basic Test (No MetaMask)
```typescript
import { test, expect } from '@playwright/test';

test('should display the landing page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

### Synpress Test (With MetaMask)
```typescript
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';

const test = testWithSynpress(metaMaskFixtures({
  seed: 'test test test test test test test test test test test junk',
  password: 'Tester@1234',
}));

test('should connect wallet', async ({ page, metamask }) => {
  await page.goto('/');
  await page.click('button:has-text("Connect")');
  await metamask.connectToDapp();
  // ... rest of test
});
```

## Common Issues and Solutions

### Issue: "MetaMask not connecting"
**Solution:** Ensure Anvil is running and the network is added correctly:
```typescript
await metamask.addNetwork({
  name: 'Anvil Local',
  rpcUrl: 'http://localhost:8545',
  chainId: 31337,
  symbol: 'ETH',
});
```

### Issue: "Contract not deployed" error
**Solution:** Make sure you've deployed the contract to Anvil:
```bash
cd ../sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Issue: "Transaction timeout"
**Solution:** Increase timeout in test:
```typescript
await expect(element).toBeVisible({ timeout: 15000 });
```

### Issue: "Tests failing in CI"
**Solution:** The `playwright.config.ts` is configured with:
- 2 retries on CI
- Screenshots on failure
- Videos on failure
- HTML report generation

### Issue: "Port 3000 already in use"
**Solution:** The config uses `reuseExistingServer: true`, so if dev server is already running, it will be reused.

## Debugging Tests

### 1. Use Playwright Inspector
```bash
npx playwright test --debug
```

### 2. Add Debug Statements
```typescript
await page.pause(); // Pauses execution
console.log(await page.content()); // Log page HTML
```

### 3. Take Screenshots
```typescript
await page.screenshot({ path: 'debug.png' });
```

### 4. Check Browser Console
```typescript
page.on('console', msg => console.log(msg.text()));
```

## Best Practices

1. **Keep Tests Independent**: Each test should be able to run in isolation
2. **Use Data-Testid**: Add `data-testid` attributes to elements for stable selectors
3. **Avoid Hard-Coded Delays**: Use `waitForSelector` instead of `waitForTimeout`
4. **Clean Up**: Reset state between tests if needed
5. **Meaningful Assertions**: Use descriptive error messages

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Start Anvil
  run: anvil &

- name: Deploy Contract
  run: cd sc && forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import the necessary fixtures:
   ```typescript
   import { test, expect } from '@playwright/test';
   // Or for MetaMask tests:
   import { testWithSynpress } from '@synthetixio/synpress';
   ```
3. Write your test cases
4. Add a npm script to `package.json` if needed
5. Run and verify the test

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Synpress Documentation](https://synpress.io/)
- [MetaMask Test dApp](https://metamask.github.io/test-dapp/)
- [Anvil Documentation](https://book.getfoundry.sh/anvil/)

## Support

If you encounter issues:
1. Check that all prerequisites are running (Anvil, dev server)
2. Review the console output and screenshots
3. Check the HTML report: `npm run playwright:report`
4. Look at the test file comments for specific setup instructions

---

**Last Updated:** October 23, 2025
**Playwright Version:** 1.56.1
**Synpress Version:** 4.1.1
