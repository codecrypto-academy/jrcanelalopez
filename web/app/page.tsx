'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Web3Service, handleContractError } from '@/lib/web3Service';

export default function Home() {
  const {
    account,
    isConnected,
    connect,
    disconnect,
    isLoading,
    error: web3Error,
    userInfo,
    isRegistered,
    isApproved,
    isPending,
    formatAddress,
    contract,
    refreshUserInfo,
  } = useWallet();

  const [selectedRole, setSelectedRole] = useState<string>('Producer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const roles = ['Producer', 'Factory', 'Retailer', 'Consumer'];

  const handleRegister = async () => {
    if (!contract) return;

    try {
      setIsSubmitting(true);
      setTxError(null);
      setTxSuccess(null);

      const service = new Web3Service(contract);
      await service.requestUserRole(selectedRole);

      setTxSuccess('Registration request submitted! Waiting for admin approval...');

      // Refresh user info to update status
      setTimeout(() => {
        refreshUserInfo();
      }, 2000);
    } catch (err: any) {
      setTxError(handleContractError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Supply Chain Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Blockchain-based traceability system
            </p>
          </div>

          {isConnected && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                <p className="font-mono text-sm font-semibold">{formatAddress(account)}</p>
              </div>
              <button
                onClick={disconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {/* Not Connected State */}
            {!isConnected && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect MetaMask to access the supply chain tracker
                </p>
                <button
                  onClick={connect}
                  disabled={isLoading}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                </button>

                {web3Error && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm">{web3Error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Connected but Not Registered */}
            {isConnected && !isRegistered && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Register Your Role
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select your role in the supply chain to request access
                </p>

                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedRole === role
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                          }`}
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">{role}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Registration'}
                  </button>

                  {/* Transaction Status */}
                  {txError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 text-sm">{txError}</p>
                    </div>
                  )}
                  {txSuccess && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 text-sm">{txSuccess}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registered but Pending Approval */}
            {isConnected && isRegistered && isPending && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Pending Approval
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Your registration as <strong>{userInfo?.role}</strong> is pending admin approval
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait for the administrator to approve your request
                </p>
              </div>
            )}

            {/* Approved - Show Dashboard Link */}
            {isConnected && isApproved && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Welcome, {userInfo?.role}!
                </h2>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <p className="text-green-800 dark:text-green-200">
                    Your account is approved and ready to use
                  </p>
                </div>
                <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Supply Chain Tracker - Educational DApp for PFM</p>
          <p className="mt-1">Built with Solidity, Foundry, Next.js & ethers.js</p>
        </footer>
      </div>
    </div>
  );
}
