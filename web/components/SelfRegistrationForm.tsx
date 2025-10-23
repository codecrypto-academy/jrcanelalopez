'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Web3Service, handleContractError } from '@/lib/web3Service';

const ROLES = [
  { value: 'Producer', label: 'Producer', description: 'Creates raw materials', icon: '🌱' },
  { value: 'Factory', label: 'Factory', description: 'Transforms materials into products', icon: '🏭' },
  { value: 'Retailer', label: 'Retailer', description: 'Distributes products', icon: '🏪' },
  { value: 'Consumer', label: 'Consumer', description: 'End user of products', icon: '👤' },
];

export default function SelfRegistrationForm() {
  const { contract, refreshUserInfo } = useWallet();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const web3Service = new Web3Service(contract);
      await web3Service.requestUserRole(selectedRole);

      setSuccess(true);

      // Refresh user info after successful registration
      setTimeout(() => {
        refreshUserInfo();
      }, 2000);

    } catch (err: any) {
      console.error('Error requesting role:', err);
      setError(handleContractError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
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
          Registration Submitted
        </h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200 mb-3">
            Your request for the <strong>{selectedRole}</strong> role has been submitted successfully.
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Your registration is now <strong>pending approval</strong> from the administrator.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
            You will be able to use the platform once the admin approves your request.
          </p>
        </div>
      </div>
    );
  }

  return (
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Register for Supply Chain Tracker
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Select your role to request access to the platform
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className={`
                relative flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all
                ${
                  selectedRole === role.value
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'
                }
              `}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="sr-only"
              />
              <span className="text-4xl mb-2">{role.icon}</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {role.label}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {role.description}
              </span>
              {selectedRole === role.value && (
                <div className="absolute top-3 right-3">
                  <svg
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedRole}
            className="w-full px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Request...' : 'Request Role'}
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            After submitting, your request will be reviewed by the administrator. You will be notified once approved.
          </p>
        </div>
      </form>
    </div>
  );
}
