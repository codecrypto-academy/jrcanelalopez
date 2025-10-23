'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service, type TransferInfo } from '@/lib/web3Service';

export default function TransfersPage() {
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading, formatAddress } = useWallet();

  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && (!isConnected || !userInfo)) {
      router.push('/');
    }
  }, [isConnected, userInfo, isLoading, router]);

  // Load transfers
  const loadTransfers = async () => {
    if (!contract || !account) {
      setLoadingTransfers(false);
      return;
    }

    try {
      setLoadingTransfers(true);
      const web3Service = new Web3Service(contract);
      const userTransfers = await web3Service.getUserTransfers(account);
      setTransfers(userTransfers);
    } catch (err) {
      console.error('Error loading transfers:', err);
      setError('Failed to load transfers');
    } finally {
      setLoadingTransfers(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [contract, account]);

  // Handle accept transfer
  const handleAccept = async (transferId: string) => {
    if (!contract) return;

    try {
      setProcessingId(transferId);
      setError('');

      const web3Service = new Web3Service(contract);
      await web3Service.acceptTransfer(Number(transferId));

      // Reload transfers
      await loadTransfers();
    } catch (err: any) {
      console.error('Error accepting transfer:', err);
      setError(err.message || 'Failed to accept transfer');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle reject transfer
  const handleReject = async (transferId: string) => {
    if (!contract) return;

    try {
      setProcessingId(transferId);
      setError('');

      const web3Service = new Web3Service(contract);
      await web3Service.rejectTransfer(Number(transferId));

      // Reload transfers
      await loadTransfers();
    } catch (err: any) {
      console.error('Error rejecting transfer:', err);
      setError(err.message || 'Failed to reject transfer');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter transfers
  const filteredTransfers = transfers.filter((transfer) => {
    if (!account) return false;

    if (filter === 'incoming') {
      return transfer.to.toLowerCase() === account.toLowerCase();
    } else if (filter === 'outgoing') {
      return transfer.from.toLowerCase() === account.toLowerCase();
    }
    return true;
  });

  // Separate by status
  const pendingTransfers = filteredTransfers.filter((t) => t.status === 'Pending');
  const completedTransfers = filteredTransfers.filter(
    (t) => t.status === 'Accepted' || t.status === 'Rejected'
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Accepted':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Transfer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your token transfers
          </p>
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
              All ({transfers.length})
            </button>
            <button
              onClick={() => setFilter('incoming')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'incoming'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Incoming (
              {transfers.filter((t) => t.to.toLowerCase() === account?.toLowerCase()).length})
            </button>
            <button
              onClick={() => setFilter('outgoing')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'outgoing'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Outgoing (
              {transfers.filter((t) => t.from.toLowerCase() === account?.toLowerCase()).length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loadingTransfers ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transfers...</p>
            </div>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">↔️</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Transfers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? 'You don\'t have any transfers yet.'
                : filter === 'incoming'
                ? 'You don\'t have any incoming transfers.'
                : 'You haven\'t sent any transfers yet.'}
            </p>
            <Link
              href="/tokens"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              View My Tokens
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Transfers */}
            {pendingTransfers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Pending Transfers
                </h2>
                <div className="space-y-4">
                  {pendingTransfers.map((transfer) => {
                    const isIncoming = transfer.to.toLowerCase() === account?.toLowerCase();

                    return (
                      <div
                        key={transfer.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                          {/* Transfer Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-2xl">
                                {isIncoming ? '📥' : '📤'}
                              </span>
                              <div>
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                  Transfer #{transfer.id}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Token #{transfer.tokenId}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  transfer.status
                                )}`}
                              >
                                {transfer.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">From:</span>
                                <p className="font-mono text-gray-800 dark:text-white">
                                  {formatAddress(transfer.from)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">To:</span>
                                <p className="font-mono text-gray-800 dark:text-white">
                                  {formatAddress(transfer.to)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                <p className="font-bold text-gray-800 dark:text-white">
                                  {transfer.amount}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Actions (only for incoming pending) */}
                          {isIncoming && transfer.status === 'Pending' && (
                            <div className="flex space-x-2 md:ml-4">
                              <button
                                onClick={() => handleAccept(transfer.id)}
                                disabled={processingId === transfer.id}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === transfer.id ? 'Processing...' : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleReject(transfer.id)}
                                disabled={processingId === transfer.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Transfers */}
            {completedTransfers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Completed Transfers
                </h2>
                <div className="space-y-4">
                  {completedTransfers.map((transfer) => {
                    const isIncoming = transfer.to.toLowerCase() === account?.toLowerCase();

                    return (
                      <div
                        key={transfer.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{isIncoming ? '📥' : '📤'}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-gray-800 dark:text-white">
                                Transfer #{transfer.id}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                  transfer.status
                                )}`}
                              >
                                {transfer.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">From:</span>
                                <p className="font-mono text-gray-800 dark:text-white">
                                  {formatAddress(transfer.from)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">To:</span>
                                <p className="font-mono text-gray-800 dark:text-white">
                                  {formatAddress(transfer.to)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Token:</span>
                                <Link
                                  href={`/tokens/${transfer.tokenId}`}
                                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  #{transfer.tokenId}
                                </Link>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                <p className="font-bold text-gray-800 dark:text-white">
                                  {transfer.amount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
