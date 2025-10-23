'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service, type TokenInfo } from '@/lib/web3Service';

export default function TransferTokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading, formatAddress } = useWallet();

  const [token, setToken] = useState<TokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState<Array<{address: string, role: string}>>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);

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
        const tokenInfo = await web3Service.getToken(Number(id), account) as TokenInfo;

        // Verify user has balance
        if (Number(tokenInfo.balance) === 0) {
          setError('You have no balance for this token');
        }

        setToken(tokenInfo);
      } catch (err: any) {
        console.error('Error loading token:', err);
        setError(err.message || 'Failed to load token');
      } finally {
        setLoadingToken(false);
      }
    };

    loadToken();
  }, [contract, account, id]);

  // Load available recipients based on user role
  useEffect(() => {
    const loadRecipients = async () => {
      if (!contract || !userInfo) {
        setLoadingRecipients(false);
        return;
      }

      try {
        const web3Service = new Web3Service(contract);
        let targetRole = '';

        // Determine target role based on current user's role
        switch (userInfo.role) {
          case 'Producer':
            targetRole = 'Factory';
            break;
          case 'Factory':
            targetRole = 'Retailer';
            break;
          case 'Retailer':
            targetRole = 'Consumer';
            break;
          default:
            setLoadingRecipients(false);
            return;
        }

        const recipients = await web3Service.getUsersByRole(targetRole);
        setAvailableRecipients(recipients);
      } catch (err) {
        console.error('Error loading recipients:', err);
      } finally {
        setLoadingRecipients(false);
      }
    };

    loadRecipients();
  }, [contract, userInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!contract || !token) {
      setError('Contract not initialized');
      return;
    }

    // Validations
    if (!recipient.trim()) {
      setError('Recipient address is required');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setError('Invalid Ethereum address');
      return;
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (transferAmount > Number(token.balance)) {
      setError(`Insufficient balance. You have ${token.balance} tokens`);
      return;
    }

    if (recipient.toLowerCase() === account?.toLowerCase()) {
      setError('Cannot transfer to yourself');
      return;
    }

    try {
      setSubmitting(true);

      const web3Service = new Web3Service(contract);

      // Initiate transfer
      await web3Service.transfer(recipient, Number(id), transferAmount);

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/transfers');
      }, 2000);
    } catch (err: any) {
      console.error('Error transferring token:', err);

      // Parse common errors
      if (err.message?.includes('InvalidRole')) {
        setError('Invalid recipient role for this transfer');
      } else if (err.message?.includes('InsufficientBalance')) {
        setError('Insufficient balance');
      } else {
        setError(err.message || 'Failed to transfer token');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get allowed recipient roles
  const getAllowedRoles = () => {
    switch (userInfo?.role) {
      case 'Producer':
        return ['Factory'];
      case 'Factory':
        return ['Retailer'];
      case 'Retailer':
        return ['Consumer'];
      default:
        return [];
    }
  };

  // Loading state
  if (isLoading || loadingToken || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Consumer check
  if (userInfo.role === 'Consumer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Transfer Not Allowed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Consumers cannot transfer tokens
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

  // Error or no token
  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Cannot Transfer
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
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

  if (!token) return null;

  const allowedRoles = getAllowedRoles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/tokens/${id}`)}
              className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
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
              Back to Token
            </button>

            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Transfer Token
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Send {token.name} to another user
            </p>
          </div>

          {/* Token Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-4xl">{token.parentId === '0' ? '🌱' : '📦'}</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {token.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Token #{token.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  Your Balance
                </p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {token.balance}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                  Total Supply
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {token.totalSupply}
                </p>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Address */}
              <div>
                <label
                  htmlFor="recipient"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Recipient Address *
                </label>
                {loadingRecipients ? (
                  <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-2"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loading recipients...</span>
                  </div>
                ) : availableRecipients.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      No {allowedRoles.join(', ')} users available. Please contact the administrator.
                    </p>
                  </div>
                ) : (
                  <select
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    required
                  >
                    <option value="">Select a recipient...</option>
                    {availableRecipients.map((recipient) => (
                      <option key={recipient.address} value={recipient.address}>
                        {formatAddress(recipient.address)} ({recipient.role})
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {availableRecipients.length > 0
                    ? `${availableRecipients.length} ${allowedRoles.join(', ')} user(s) available`
                    : `Must be a user with role: ${allowedRoles.join(', ')}`
                  }
                </p>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Amount *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                    min="1"
                    max={token.balance}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(token.balance)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Max
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Available: {token.balance} tokens
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Transfer initiated successfully! Redirecting...
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/tokens/${id}`)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || Number(token.balance) === 0 || availableRecipients.length === 0 || loadingRecipients}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Transferring...
                    </span>
                  ) : (
                    'Transfer'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Transfer Rules
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>As a {userInfo.role}, you can only transfer to approved {allowedRoles.join(', ')} users</li>
              <li>Select the recipient from the dropdown of available users</li>
              <li>Transfer will be pending until recipient accepts</li>
              <li>Recipient can accept or reject the transfer</li>
              <li>You cannot cancel once the transfer is initiated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
