'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';

export function Navbar() {
  const { account, isConnected, userInfo, disconnect, formatAddress, getRoleColor } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userInfo?.role === 'Admin';

  // Navigation items based on role
  const getNavItems = () => {
    if (!isConnected || !userInfo) return [];

    const items = [
      { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { name: 'My Tokens', href: '/tokens', icon: '🪙' },
      { name: 'Transfers', href: '/transfers', icon: '↔️' },
    ];

    if (isAdmin) {
      items.push({ name: 'Admin Panel', href: '/admin/users', icon: '⚙️' });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={isConnected && userInfo ? '/dashboard' : '/'}
            className="flex items-center space-x-2"
          >
            <span className="text-2xl">⛓️</span>
            <span className="font-bold text-xl text-gray-800 dark:text-white">
              Supply Chain Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isConnected && userInfo && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* User Info & Disconnect */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected && account && (
              <>
                {/* User Badge */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {userInfo && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(
                        userInfo.role
                      )}`}
                    >
                      {userInfo.role}
                    </span>
                  )}
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {formatAddress(account)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isConnected && userInfo && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isConnected && userInfo && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Navigation Links */}
            <div className="space-y-1 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Info */}
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(
                    userInfo.role
                  )}`}
                >
                  {userInfo.role}
                </span>
              </div>
              <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {formatAddress(account)}
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                disconnect();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
