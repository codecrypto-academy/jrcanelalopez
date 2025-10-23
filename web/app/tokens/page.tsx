'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service, type TokenInfo } from '@/lib/web3Service';

export default function TokensPage() {
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'received'>('all');

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && (!isConnected || !userInfo)) {
      router.push('/');
    }
  }, [isConnected, userInfo, isLoading, router]);

  // Load tokens
  useEffect(() => {
    const loadTokens = async () => {
      if (!contract || !account) {
        setLoadingTokens(false);
        return;
      }

      try {
        const web3Service = new Web3Service(contract);
        const userTokens = await web3Service.getUserTokens(account);
        setTokens(userTokens);
      } catch (err) {
        console.error('Error loading tokens:', err);
      } finally {
        setLoadingTokens(false);
      }
    };

    loadTokens();
  }, [contract, account]);

  // Filter tokens
  const filteredTokens = tokens.filter((token) => {
    if (!account) return false;

    if (filter === 'created') {
      return token.creator.toLowerCase() === account.toLowerCase();
    } else if (filter === 'received') {
      return token.creator.toLowerCase() !== account.toLowerCase();
    }
    return true;
  });

  // Loading state
  if (isLoading || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              My Tokens
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View and manage your tokens
            </p>
          </div>
          <Link
            href="/tokens/create"
            className="mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold inline-flex items-center"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Token
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Tokens ({tokens.length})
            </button>
            <button
              onClick={() => setFilter('created')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'created'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Created by Me (
              {tokens.filter((t) => t.creator.toLowerCase() === account?.toLowerCase()).length})
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'received'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Received (
              {tokens.filter((t) => t.creator.toLowerCase() !== account?.toLowerCase()).length})
            </button>
          </div>
        </div>

        {/* Tokens List */}
        {loadingTokens ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tokens...</p>
            </div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Tokens Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? 'You don\'t have any tokens yet. Create your first token to get started!'
                : filter === 'created'
                ? 'You haven\'t created any tokens yet.'
                : 'You haven\'t received any tokens yet.'}
            </p>
            {filter === 'all' && (
              <Link
                href="/tokens/create"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Create Your First Token
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="p-6">
                  {/* Token Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">
                          {token.parentId === '0' ? '🌱' : '📦'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {token.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Token #{token.id}
                      </p>
                    </div>
                    {token.creator.toLowerCase() === account?.toLowerCase() && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
                        Created
                      </span>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Balance:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {token.balance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Supply:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {token.totalSupply}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {token.parentId === '0' ? 'Raw Material' : 'Product'}
                      </span>
                    </div>
                    {token.parentId !== '0' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Parent Token:
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          #{token.parentId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/tokens/${token.id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm font-semibold"
                    >
                      View Details
                    </Link>
                    {Number(token.balance) > 0 && userInfo.role !== 'Consumer' && (
                      <Link
                        href={`/tokens/${token.id}/transfer`}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-semibold"
                      >
                        Transfer
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
