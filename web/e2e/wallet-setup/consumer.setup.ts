import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

// Anvil test account #4 (Consumer) - CONSUMER_WALLET_SETUP
// Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
const PASSWORD = 'Tester@1234';
const SEED_PHRASE = 'test test test test test test test test test test test junk';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);
  await metamask.importWallet(SEED_PHRASE);
  // Create accounts #2, #3, #4, and #5
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.switchAccount('Account 5'); // Switch to the fifth account (Consumer)
});
