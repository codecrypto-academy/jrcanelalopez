'use client';

import { useState } from 'react';
import { Web3Service, handleContractError } from '@/lib/web3Service';
import { Contract } from 'ethers';

interface RegisterUserFormProps {
  contract: Contract;
  onSuccess: () => void;
}

const ROLES = ['Producer', 'Factory', 'Retailer', 'Consumer'];

export function RegisterUserForm({ contract, onSuccess }: RegisterUserFormProps) {
  const [userAddress, setUserAddress] = useState('');
  const [role, setRole] = useState('Producer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress || !role) {
      setError('Please fill in all fields');
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      setError('Invalid Ethereum address format');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const web3Service = new Web3Service(contract);
      await web3Service.registerUser(userAddress, role);

      setSuccess(`User registered successfully as ${role}!`);
      setUserAddress('');
      setRole('Producer');

      // Call parent callback to refresh user list
      setTimeout(() => {
        onSuccess();
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      console.error('Error registering user:', err);
      setError(handleContractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Register New User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Address Input */}
        <div>
          <label htmlFor="userAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ethereum Address
          </label>
          <input
            type="text"
            id="userAddress"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter the full Ethereum address (42 characters starting with 0x)
          </p>
        </div>

        {/* Role Select */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Producer → Factory → Retailer → Consumer
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registering...' : 'Register User'}
        </button>
      </form>

      {/* Quick Access Accounts */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Anvil Test Accounts (Quick Fill)
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {[
            { role: 'Producer', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
            { role: 'Factory', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
            { role: 'Retailer', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
            { role: 'Consumer', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' },
          ].map((account) => (
            <button
              key={account.address}
              type="button"
              onClick={() => {
                setUserAddress(account.address);
                setRole(account.role);
              }}
              className="text-left px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
              disabled={isLoading}
            >
              <span className="font-semibold text-gray-700 dark:text-gray-300">{account.role}:</span>{' '}
              <span className="font-mono text-gray-600 dark:text-gray-400">{account.address}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
