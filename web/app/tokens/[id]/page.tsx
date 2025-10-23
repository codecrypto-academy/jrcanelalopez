'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service, type TokenInfo } from '@/lib/web3Service';

export default function TokenDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading, formatAddress } = useWallet();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [parentToken, setParentToken] = useState<TokenInfo | null>(null);
  const [error, setError] = useState('');

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && (!isConnected || !userInfo)) {
      router.push('/');
    }
  }, [isConnected, userInfo, isLoading, router]);

  // Load token details
  useEffect(() => {
    const loadToken = async () => {
      if (!contract || !account) {
        setLoadingToken(false);
        return;
      }

      try {
        const web3Service = new Web3Service(contract);

        // Get token info
        const tokenInfo = await web3Service.getToken(Number(id));
        setToken(tokenInfo);

        // Load parent token if exists
        if (tokenInfo.parentId !== '0') {
          try {
            const parent = await web3Service.getToken(Number(tokenInfo.parentId));
            setParentToken(parent);
          } catch (err) {
            console.error('Error loading parent token:', err);
          }
        }
      } catch (err: any) {
        console.error('Error loading token:', err);
        setError(err.message || 'Failed to load token');
      } finally {
        setLoadingToken(false);
      }
    };

    loadToken();
  }, [contract, account, id]);

  // Loading state
  if (isLoading || loadingToken || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading token...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Token Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'The token you are looking for does not exist'}
            </p>
            <button
              onClick={() => router.push('/tokens')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Back to Tokens
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = token.creator.toLowerCase() === account?.toLowerCase();
  const hasBalance = Number(token.balance) > 0;
  const canTransfer = hasBalance && userInfo.role !== 'Consumer';

  // Parse features JSON
  let features: any = {};
  try {
    features = JSON.parse(token.features || '{}');
  } catch {
    features = {};
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/tokens')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tokens
          </button>

          {canTransfer && (
            <Link
              href={`/tokens/${id}/transfer`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold inline-flex items-center"
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
              Transfer Token
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">
                    {token.parentId === '0' ? '🌱' : '📦'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                      {token.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Token #{token.id}</p>
                  </div>
                </div>

                {isCreator && (
                  <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-semibold rounded-lg">
                    Created by You
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {token.balance}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                    Total Supply
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {token.totalSupply}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Type</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {token.parentId === '0' ? 'Raw' : 'Product'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Token Details
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Token ID</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    #{token.id}
                  </span>
                </div>

                <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Creator</span>
                  <span className="font-mono text-sm text-gray-800 dark:text-white">
                    {formatAddress(token.creator)}
                  </span>
                </div>

                <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Created At</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {new Date(Number(token.dateCreated) * 1000).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Parent Token</span>
                  {token.parentId === '0' ? (
                    <span className="font-semibold text-gray-800 dark:text-white">
                      None (Raw Material)
                    </span>
                  ) : (
                    <Link
                      href={`/tokens/${token.parentId}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      #{token.parentId}
                      {parentToken && ` - ${parentToken.name}`}
                    </Link>
                  )}
                </div>

                <div className="flex justify-between items-start py-3">
                  <span className="text-gray-600 dark:text-gray-400">Your Balance</span>
                  <div className="text-right">
                    <span className="font-bold text-2xl text-gray-800 dark:text-white">
                      {token.balance}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      / {token.totalSupply}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features/Metadata */}
            {Object.keys(features).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Features & Metadata
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                    {JSON.stringify(features, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {canTransfer ? (
                  <Link
                    href={`/tokens/${id}/transfer`}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-center block"
                  >
                    Transfer Token
                  </Link>
                ) : !hasBalance ? (
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No balance to transfer
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Consumers cannot transfer
                    </p>
                  </div>
                )}

                <Link
                  href="/tokens"
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-center block"
                >
                  View All Tokens
                </Link>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3">
                Token Information
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    This token {token.parentId === '0' ? 'is a raw material' : 'is derived from another token'}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You own {token.balance} out of {token.totalSupply} tokens</span>
                </li>
                {isCreator && (
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>You created this token</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
