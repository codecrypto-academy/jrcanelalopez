'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service } from '@/lib/web3Service';

interface DashboardStats {
  myTokensCount: number;
  pendingTransfersCount: number;
  totalTokensCreated: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading } = useWallet();
  const [stats, setStats] = useState<DashboardStats>({
    myTokensCount: 0,
    pendingTransfersCount: 0,
    totalTokensCreated: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Redirect if not connected or not approved
  useEffect(() => {
    if (!isLoading && (!isConnected || !userInfo)) {
      router.push('/');
    }
  }, [isConnected, userInfo, isLoading, router]);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!contract || !account) {
        setLoadingStats(false);
        return;
      }

      try {
        const web3Service = new Web3Service(contract);

        // Get user's tokens
        const tokens = await web3Service.getUserTokens(account);

        // Get user's transfers
        const transfers = await web3Service.getUserTransfers(account);
        const pendingTransfers = transfers.filter(
          (t) => t.status === 'Pending' && t.to.toLowerCase() === account.toLowerCase()
        );

        setStats({
          myTokensCount: tokens.length,
          pendingTransfersCount: pendingTransfers.length,
          totalTokensCreated: tokens.filter(
            (t) => t.creator.toLowerCase() === account.toLowerCase()
          ).length,
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [contract, account]);

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Producer':
        return 'Create raw material tokens and transfer them to Factories';
      case 'Factory':
        return 'Receive materials from Producers, create products, and transfer to Retailers';
      case 'Retailer':
        return 'Receive products from Factories and distribute to Consumers';
      case 'Consumer':
        return 'Receive final products from Retailers';
      case 'Admin':
        return 'Manage users and system configuration';
      default:
        return '';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Producer':
        return '🌱';
      case 'Factory':
        return '🏭';
      case 'Retailer':
        return '🏪';
      case 'Consumer':
        return '👤';
      case 'Admin':
        return '⚙️';
      default:
        return '📦';
    }
  };

  const getQuickActions = () => {
    const isAdmin = userInfo.role === 'Admin';

    const actions = [
      {
        name: 'View My Tokens',
        href: '/tokens',
        icon: '🪙',
        description: 'See all your tokens and balances',
        color: 'bg-blue-500 hover:bg-blue-600',
      },
      {
        name: 'Create Token',
        href: '/tokens/create',
        icon: '➕',
        description: 'Create a new token',
        color: 'bg-green-500 hover:bg-green-600',
      },
      {
        name: 'Manage Transfers',
        href: '/transfers',
        icon: '↔️',
        description: 'Accept or reject incoming transfers',
        color: 'bg-purple-500 hover:bg-purple-600',
      },
    ];

    if (isAdmin) {
      actions.push({
        name: 'Admin Panel',
        href: '/admin/users',
        icon: '⚙️',
        description: 'Manage users and permissions',
        color: 'bg-red-500 hover:bg-red-600',
      });
    }

    return actions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{getRoleIcon(userInfo.role)}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome back, {userInfo.role}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {getRoleDescription(userInfo.role)}
              </p>
              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-mono">{account}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🪙</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {loadingStats ? '...' : stats.myTokensCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">My Tokens</p>
              </div>
            </div>
            <Link
              href="/tokens"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">⏳</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {loadingStats ? '...' : stats.pendingTransfersCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Transfers</p>
              </div>
            </div>
            <Link
              href="/transfers"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">✨</div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {loadingStats ? '...' : stats.totalTokensCreated}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tokens Created</p>
              </div>
            </div>
            <Link
              href="/tokens"
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
            >
              View created →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getQuickActions().map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} text-white rounded-xl p-6 transition-all hover:scale-105 shadow-lg`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="font-bold text-lg mb-1">{action.name}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Role-Specific Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Getting Started
          </h2>
          <div className="space-y-4">
            {userInfo.role === 'Producer' && (
              <>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Create Raw Material Tokens
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Use parentId = 0 to create raw materials
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Transfer to Factories
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      You can only transfer tokens to users with Factory role
                    </p>
                  </div>
                </div>
              </>
            )}
            {userInfo.role === 'Factory' && (
              <>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Receive Raw Materials
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Accept incoming transfers from Producers
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Create Products
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Transform materials into products (specify parentId)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Transfer to Retailers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Send finished products to Retailers
                    </p>
                  </div>
                </div>
              </>
            )}
            {userInfo.role === 'Retailer' && (
              <>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Receive Products
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Accept incoming transfers from Factories
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Distribute to Consumers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Transfer products to end consumers
                    </p>
                  </div>
                </div>
              </>
            )}
            {userInfo.role === 'Consumer' && (
              <div className="flex items-start space-x-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Receive Final Products
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Accept transfers from Retailers. As a Consumer, you cannot transfer tokens
                    to others.
                  </p>
                </div>
              </div>
            )}
            {userInfo.role === 'Admin' && (
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Manage the System
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Register new users and manage their status (approve/reject)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
