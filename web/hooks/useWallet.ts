import { useState, useEffect } from 'react';
import { useWeb3, UserStatus } from '@/contexts/Web3Context';
import { Web3Service } from '@/lib/web3Service';

/**
 * Custom hook for wallet operations
 * Wraps useWeb3 with additional utilities for wallet management
 */
export function useWallet() {
  const web3Context = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);

  // Helper: Check if user is registered (exists in contract)
  const isRegistered = web3Context.userInfo !== null;

  // Helper: Check if user is approved
  const isApproved = web3Context.userInfo?.status === UserStatus.Approved;

  // Helper: Check if user is pending approval
  const isPending = web3Context.userInfo?.status === UserStatus.Pending;

  // Helper: Check if user is rejected
  const isRejected = web3Context.userInfo?.status === UserStatus.Rejected;

  // Helper: Get user role
  const userRole = web3Context.userInfo?.role || null;

  // Helper: Format address for display (0x1234...5678)
  const formatAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper: Get user status label
  const getStatusLabel = (): string => {
    if (!web3Context.userInfo) return 'Not Registered';

    switch (web3Context.userInfo.status) {
      case UserStatus.Pending:
        return 'Pending Approval';
      case UserStatus.Approved:
        return 'Approved';
      case UserStatus.Rejected:
        return 'Rejected';
      case UserStatus.Canceled:
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  // Helper: Check if user can perform actions (approved only)
  const canPerformActions = isApproved;

  // Helper: Get role color for UI
  const getRoleColor = (): string => {
    if (!userRole) return 'gray';

    switch (userRole.toLowerCase()) {
      case 'producer':
        return 'green';
      case 'factory':
        return 'blue';
      case 'retailer':
        return 'purple';
      case 'consumer':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!web3Context.account || !web3Context.contract) {
        setIsAdmin(false);
        return;
      }

      try {
        const web3Service = new Web3Service(web3Context.contract);
        const adminStatus = await web3Service.isAdmin(web3Context.account);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [web3Context.account, web3Context.contract]);

  return {
    // Original Web3Context values
    ...web3Context,

    // Additional helpers
    isRegistered,
    isApproved,
    isPending,
    isRejected,
    isAdmin,
    userRole,
    formatAddress,
    getStatusLabel,
    canPerformActions,
    getRoleColor,
  };
}
