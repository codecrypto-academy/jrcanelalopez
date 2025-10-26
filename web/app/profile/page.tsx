'use client';

import { useWallet } from '@/hooks/useWallet';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Web3Service } from '@/lib/web3Service';

interface TokenBalance {
  tokenId: number;
  name: string;
  balance: number;
  totalSupply: number;
  creator: string;
  dateCreated: number;
}

interface TransferInfo {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  amount: number;
  status: string;
  dateCreated: number;
  tokenName?: string;
}

interface UserStats {
  tokensOwned: number;
  tokensCreated: number;
  transfersSent: number;
  transfersReceived: number;
  pendingTransfers: number;
}

export default function ProfilePage() {
  const { account, userInfo, isConnected, formatAddress, getStatusLabel, getRoleColor, contract } = useWallet();
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [transfers, setTransfers] = useState<TransferInfo[]>([]);
  const [stats, setStats] = useState<UserStats>({
    tokensOwned: 0,
    tokensCreated: 0,
    transfersSent: 0,
    transfersReceived: 0,
    pendingTransfers: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadProfileData = useCallback(async () => {
    if (!account || !contract) return;

    try {
      setLoading(true);

      // Crear instancia del servicio Web3
      const web3Service = new Web3Service(contract);

      // Cargar tokens del usuario
      const userTokenIds = await web3Service.getUserTokenIds(account);
      const tokenDetails = await Promise.all(
        userTokenIds.map(async (id) => {
          const token = await web3Service.getToken(id);
          const balance = await web3Service.getTokenBalance(id, account);
          return {
            tokenId: id,
            name: token.name,
            balance,
            totalSupply: token.totalSupply,
            creator: token.creator,
            dateCreated: token.dateCreated,
          };
        })
      );
      setTokens(tokenDetails.filter(t => t.balance > 0));

      // Cargar transferencias del usuario (ya incluye toda la información formateada)
      const userTransfers = await web3Service.getUserTransfers(account);

      // Agregar nombre del token a cada transferencia
      const transfersWithTokenNames = await Promise.all(
        userTransfers.map(async (transfer) => {
          try {
            const token = await web3Service.getToken(Number(transfer.tokenId));
            return {
              ...transfer,
              id: Number(transfer.id),
              tokenId: Number(transfer.tokenId),
              amount: Number(transfer.amount),
              tokenName: token.name
            };
          } catch {
            return {
              ...transfer,
              id: Number(transfer.id),
              tokenId: Number(transfer.tokenId),
              amount: Number(transfer.amount),
              tokenName: `Token #${transfer.tokenId}`
            };
          }
        })
      );
      setTransfers(transfersWithTokenNames);

      // Calcular estadísticas
      const tokensCreated = tokenDetails.filter(t => t.creator.toLowerCase() === account.toLowerCase()).length;
      const transfersSent = transfersWithTokenNames.filter(t => t.from.toLowerCase() === account.toLowerCase()).length;
      const transfersReceived = transfersWithTokenNames.filter(t => t.to.toLowerCase() === account.toLowerCase()).length;
      const pendingTransfers = transfersWithTokenNames.filter(
        t => t.status === 'Pending' && t.to.toLowerCase() === account.toLowerCase()
      ).length;

      setStats({
        tokensOwned: tokenDetails.filter(t => t.balance > 0).length,
        tokensCreated,
        transfersSent,
        transfersReceived,
        pendingTransfers,
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    loadProfileData();
  }, [isConnected, loadProfileData, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Información personal y actividad en la cadena de suministro</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Información del Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dirección Ethereum</p>
              <p className="font-mono text-lg">{formatAddress(account)}</p>
              <p className="text-xs text-gray-500 mt-1">{account}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Rol</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(userInfo.role)}`}>
                {userInfo.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                {getStatusLabel(userInfo.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">ID de Usuario</p>
              <p className="text-lg font-semibold">#{userInfo.id}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Tokens en Posesión</p>
            <p className="text-3xl font-bold text-blue-600">{stats.tokensOwned}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Tokens Creados</p>
            <p className="text-3xl font-bold text-green-600">{stats.tokensCreated}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Transferencias Enviadas</p>
            <p className="text-3xl font-bold text-purple-600">{stats.transfersSent}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Transferencias Recibidas</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.transfersReceived}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingTransfers}</p>
          </div>
        </div>

        {/* Token Portfolio */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Portfolio de Tokens</h2>
          {loading ? (
            <p className="text-gray-600">Cargando tokens...</p>
          ) : tokens.length === 0 ? (
            <p className="text-gray-600">No tienes tokens actualmente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supply Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tokens.map((token) => (
                    <tr key={token.tokenId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{token.tokenId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{token.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {token.balance}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {token.totalSupply}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {token.creator.toLowerCase() === account.toLowerCase() ? (
                          <span className="text-green-600 font-semibold">Tú</span>
                        ) : (
                          formatAddress(token.creator)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(token.dateCreated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/tokens/${token.tokenId}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transfer History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Historial de Transferencias</h2>
          {loading ? (
            <p className="text-gray-600">Cargando transferencias...</p>
          ) : transfers.length === 0 ? (
            <p className="text-gray-600">No tienes transferencias registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">De/Para</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => {
                    const isSent = transfer.from.toLowerCase() === account.toLowerCase();
                    return (
                      <tr key={transfer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{transfer.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isSent ? (
                            <span className="text-red-600 font-semibold">↑ Enviada</span>
                          ) : (
                            <span className="text-green-600 font-semibold">↓ Recibida</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transfer.tokenName} (#{transfer.tokenId})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          {transfer.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {isSent ? formatAddress(transfer.to) : formatAddress(transfer.from)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(transfer.dateCreated)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver al Dashboard
          </button>
          <button
            onClick={() => router.push('/tokens')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Mis Tokens
          </button>
          <button
            onClick={() => router.push('/transfers')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver Transferencias
          </button>
        </div>
      </div>
    </div>
  );
}
