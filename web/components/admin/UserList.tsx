'use client';

import { useState, useEffect } from 'react';
import { Web3Service, handleContractError } from '@/lib/web3Service';
import { UserStatus } from '@/contexts/Web3Context';
import { Contract } from 'ethers';

interface User {
  id: number;
  userAddress: string;
  role: string;
  status: number;
}

interface UserListProps {
  contract: Contract;
  refreshTrigger: number;
}

export function UserList({ contract, refreshTrigger }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const web3Service = new Web3Service(contract);

      // Get next user ID to know how many users to fetch
      const nextUserId = await web3Service.getNextUserId();
      console.log('[UserList] Next User ID:', nextUserId);

      // Get all users
      const allUsers = await web3Service.getAllUsers(nextUserId);
      console.log('[UserList] Fetched users:', allUsers);

      setUsers(allUsers);
    } catch (err: any) {
      console.error('[UserList] Error fetching users:', err);
      setError(handleContractError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchUsers();
    }
  }, [contract, refreshTrigger]);

  const handleChangeStatus = async (userAddress: string, newStatus: UserStatus) => {
    try {
      setActionLoading(users.findIndex(u => u.userAddress === userAddress));

      const web3Service = new Web3Service(contract);
      await web3Service.changeStatusUser(userAddress, newStatus);

      // Refresh list
      await fetchUsers();
    } catch (err: any) {
      console.error('Error changing user status:', err);
      alert(handleContractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case UserStatus.Pending:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Pending
          </span>
        );
      case UserStatus.Approved:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Approved
          </span>
        );
      case UserStatus.Rejected:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Rejected
          </span>
        );
      case UserStatus.Canceled:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Canceled
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Producer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Factory: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Retailer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Consumer: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Registered Users
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Registered Users
        </h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Registered Users
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total: {users.length}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No users</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by registering a new user
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100" title={user.userAddress}>
                      {formatAddress(user.userAddress)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {user.status !== UserStatus.Approved && (
                        <button
                          onClick={() => handleChangeStatus(user.userAddress, UserStatus.Approved)}
                          disabled={actionLoading === index}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {user.status !== UserStatus.Rejected && (
                        <button
                          onClick={() => handleChangeStatus(user.userAddress, UserStatus.Rejected)}
                          disabled={actionLoading === index}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      {user.status !== UserStatus.Canceled && (
                        <button
                          onClick={() => handleChangeStatus(user.userAddress, UserStatus.Canceled)}
                          disabled={actionLoading === index}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
