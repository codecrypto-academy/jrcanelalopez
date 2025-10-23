import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

// Anvil test account #3 (Retailer) - RETAILER_WALLET_SETUP
// Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
const PASSWORD = 'Tester@1234';
const SEED_PHRASE = 'test test test test test test test test test test test junk';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);
  await metamask.importWallet(SEED_PHRASE);
  // Create accounts #2, #3, and #4
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.switchAccount('Account 4'); // Switch to the fourth account (Retailer)
});
