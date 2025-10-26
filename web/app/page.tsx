'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Web3Service, handleContractError } from '@/lib/web3Service';
import SelfRegistrationForm from '@/components/SelfRegistrationForm';

export default function Home() {
  const router = useRouter();
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
    isRejected,
    isAdmin,
    formatAddress,
    contract,
    refreshUserInfo,
  } = useWallet();

  const handleSwitchAccount = async () => {
    try {
      // Request MetaMask to show account selection
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      // MetaMask will reload the page after account selection
    } catch (err) {
      console.error('Failed to switch account:', err);
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

            {/* Connected but Not Registered - Admin View */}
            {isConnected && !isRegistered && isAdmin && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Welcome, Administrator!
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
                  <p className="text-purple-800 dark:text-purple-200 mb-3">
                    You are connected as the <strong>contract owner</strong>
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Account: <span className="font-mono font-semibold block mt-2">{account}</span>
                  </p>
                </div>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Go to Admin Panel
                </button>
              </div>
            )}

            {/* Connected but Not Registered - Regular User - Show Self-Registration Form */}
            {isConnected && !isRegistered && !isAdmin && (
              <SelfRegistrationForm />
            )}

            {/* Registered and Pending Approval */}
            {isConnected && isPending && (
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
                  Registration Pending
                </h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    Your request for the <strong>{userInfo?.role}</strong> role is awaiting administrator approval.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Account: <span className="font-mono font-semibold block mt-2">{account}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      You will be able to use the platform once the admin approves your request.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleSwitchAccount}
                    className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Switch to Another Account
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Or try connecting with an approved account
                  </p>
                </div>
              </div>
            )}

            {/* Registered but Rejected */}
            {isConnected && isRegistered && isRejected && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Registration Rejected
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-800 dark:text-red-200 mb-2">
                    Your registration as <strong>{userInfo?.role}</strong> was rejected by the administrator
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Account: <span className="font-mono">{formatAddress(account)}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-300">
                    Please contact the administrator for more information or try with a different account.
                  </p>
                  <button
                    onClick={handleSwitchAccount}
                    className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Switch to Another Account
                  </button>
                </div>
              </div>
            )}

            {/* Approved - Admin */}
            {isConnected && isApproved && isAdmin && (
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-24 w-24 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                  Welcome, Administrator!
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                  <p className="text-purple-800 dark:text-purple-200">
                    Your account is approved and ready to manage the system
                  </p>
                </div>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Go to Admin Panel
                </button>
              </div>
            )}

            {/* Approved - Regular User */}
            {isConnected && isApproved && !isAdmin && (
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
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
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
