"use server";

import { ethers } from 'ethers';
import fs from 'fs';
const provider = new ethers.JsonRpcProvider(process.env.BESU_URL);

export async function faucetSubmit(formData: FormData) {
  
  const account = formData.get('account') as string;
  if (!account) throw new Error('Account is required');

  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_FILE || '', 'utf8');

  const wallet = new ethers.Wallet(privateKey, provider);
  const ethValue = formData.get('eth');
  if (!ethValue) throw new Error('ETH value is required');
  const tx = await wallet.sendTransaction({
    to: account,
    value: ethers.parseEther(ethValue.toString()) // Sending ETH
  });

  await tx.wait();
  return { success: true };
}

export async function balanceSubmit(formData: FormData) {
  
  const account = formData.get('account') as string;
  if (!account) throw new Error('Account is required');

  const balance = await provider.getBalance(account);
  return { balance: ethers.formatEther(balance) };
}
