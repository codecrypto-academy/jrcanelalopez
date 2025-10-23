import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

// Anvil test account #1 (Producer) - PRODUCER_WALLET_SETUP
// Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
const PASSWORD = 'Tester@1234';
const SEED_PHRASE = 'test test test test test test test test test test test junk';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);
  await metamask.importWallet(SEED_PHRASE);
  // Create account #2 (Producer) - derived from the same seed phrase
  await metamask.createAccount();
  await metamask.switchAccount('Account 2'); // Switch to the newly created account
});
