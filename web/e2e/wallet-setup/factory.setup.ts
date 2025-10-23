import { defineWalletSetup } from '@synthetixio/synpress';
import { MetaMask } from '@synthetixio/synpress/playwright';

// Anvil test account #2 (Factory) - FACTORY_WALLET_SETUP
// Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
const PASSWORD = 'Tester@1234';
const SEED_PHRASE = 'test test test test test test test test test test test junk';

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);
  await metamask.importWallet(SEED_PHRASE);
  // Create accounts #2 and #3
  await metamask.createAccount();
  await metamask.createAccount();
  await metamask.switchAccount('Account 3'); // Switch to the third account (Factory)
});
