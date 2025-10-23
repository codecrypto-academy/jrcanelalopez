'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Navbar } from '@/components/Navbar';
import { Web3Service, type TokenInfo } from '@/lib/web3Service';

export default function CreateTokenPage() {
  const router = useRouter();
  const { account, isConnected, userInfo, contract, isLoading } = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    totalSupply: '',
    features: '',
    parentId: '0',
  });

  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const canCreateRawMaterial = userInfo?.role === 'Producer';
  const mustHaveParent = userInfo?.role === 'Factory' || userInfo?.role === 'Retailer';

  // Redirect if not connected
  useEffect(() => {
    if (!isLoading && (!isConnected || !userInfo)) {
      router.push('/');
    }
  }, [isConnected, userInfo, isLoading, router]);

  // Load available tokens for parentId
  useEffect(() => {
    const loadTokens = async () => {
      if (!contract || !account || !mustHaveParent) return;

      try {
        const web3Service = new Web3Service(contract);
        const userTokens = await web3Service.getUserTokens(account);
        // Only show tokens with balance > 0
        const tokensWithBalance = userTokens.filter((t) => Number(t.balance) > 0);
        setAvailableTokens(tokensWithBalance);

        // Auto-select first token if available and parentId is still 0
        if (tokensWithBalance.length > 0 && formData.parentId === '0') {
          setFormData(prev => ({ ...prev, parentId: tokensWithBalance[0].id.toString() }));
        }
      } catch (err) {
        console.error('Error loading tokens:', err);
      }
    };

    loadTokens();
  }, [contract, account, mustHaveParent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!contract || !account) {
      setError('Wallet not connected');
      return;
    }

    // Validations
    if (!formData.name.trim()) {
      setError('Token name is required');
      return;
    }

    const supply = Number(formData.totalSupply);
    if (isNaN(supply) || supply <= 0) {
      setError('Total supply must be a positive number');
      return;
    }

    if (mustHaveParent && formData.parentId === '0') {
      setError(`${userInfo?.role}s must specify a parent token`);
      return;
    }

    if (!canCreateRawMaterial && formData.parentId === '0') {
      setError('Only Producers can create raw material tokens');
      return;
    }

    try {
      setSubmitting(true);

      const web3Service = new Web3Service(contract);

      // Create the token
      await web3Service.createToken(
        formData.name,
        supply,
        formData.features || '{}',
        Number(formData.parentId)
      );

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/tokens');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating token:', err);
      setError(err.message || 'Failed to create token');
    } finally {
      setSubmitting(false);
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

  // Consumer role check
  if (userInfo.role === 'Consumer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Action Not Allowed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Consumers cannot create tokens
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Create New Token
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {canCreateRawMaterial
                ? 'Create a new raw material token (parentId = 0)'
                : 'Create a new product token from existing materials'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Token Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Organic Wheat, Bread, etc."
                  required
                />
              </div>

              {/* Total Supply */}
              <div>
                <label
                  htmlFor="totalSupply"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Total Supply *
                </label>
                <input
                  type="number"
                  id="totalSupply"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. 1000"
                  min="1"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Initial amount of tokens to create
                </p>
              </div>

              {/* Parent Token */}
              <div>
                <label
                  htmlFor="parentId"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Parent Token {mustHaveParent && '*'}
                </label>
                {canCreateRawMaterial && !mustHaveParent ? (
                  <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      As a Producer, you can create raw material tokens (no parent required)
                    </p>
                  </div>
                ) : availableTokens.length === 0 ? (
                  <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You don't have any tokens with balance to use as parent. You need to
                      receive tokens first.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      id="parentId"
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required={mustHaveParent}
                    >
                      {!mustHaveParent && <option value="0">No parent (Raw Material)</option>}
                      {availableTokens.map((token) => (
                        <option key={token.id} value={token.id}>
                          #{token.id} - {token.name} (Balance: {token.balance})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {availableTokens.length > 0
                        ? `${availableTokens.length} token(s) available - Selected: ${availableTokens.find(t => t.id.toString() === formData.parentId)?.name || 'None'}`
                        : 'Select the token this product is derived from'
                      }
                    </p>
                  </>
                )}
              </div>

              {/* Features/Metadata */}
              <div>
                <label
                  htmlFor="features"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  Features / Metadata (Optional)
                </label>
                <textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white h-32"
                  placeholder='{"origin": "Spain", "organic": true, "expiry": "2025-12-31"}'
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  JSON format for additional token metadata
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
                    Token created successfully! Redirecting...
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/tokens')}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (mustHaveParent && availableTokens.length === 0)}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Creating...
                    </span>
                  ) : (
                    'Create Token'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Important Notes
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>You will receive the entire token supply in your balance</li>
              <li>Token ID will be auto-generated by the smart contract</li>
              {canCreateRawMaterial && (
                <li>As a Producer, use parentId = 0 for raw materials</li>
              )}
              {mustHaveParent && (
                <li>As a {userInfo.role}, you must specify a parent token from your inventory</li>
              )}
              <li>Features field should be valid JSON or leave empty</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
