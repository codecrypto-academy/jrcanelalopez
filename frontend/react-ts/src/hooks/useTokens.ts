import { useState, useEffect, useCallback } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import type { TokenData } from '../types';
import { TOKEN_TYPE_NAMES, TOKEN_TYPE_COLORS, type TokenTypeValue } from '../constants/contract';

export const useTokens = () => {
  const { contract } = useBlockchain();
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mover fetchTokens fuera del useEffect para poder usarlo en el listener
  const fetchTokens = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      
      // Obtener el número total de tokens
      const totalSupply = await contract.totalSupply();
      const total = Number(totalSupply);
      
      if (total === 0) {
        setTokens([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Iterar del 1 al totalSupply (los IDs empiezan en 1)
      const tokenDataPromises = [];
      for (let i = 1; i <= total; i++) {
        tokenDataPromises.push(
          (async (tokenId: number) => {
            try {
              const metadata = await contract.getTokenMetadata(tokenId);
              const tokenTypeNum = Number(metadata.tokenType) as TokenTypeValue;
              return {
                id: BigInt(tokenId),
                creator: metadata.producer,
                tokenType: Number(metadata.tokenType),
                parent1: metadata.parent1,
                parent2: metadata.parent2,
                timestamp: metadata.createdAt,
                typeName: TOKEN_TYPE_NAMES[tokenTypeNum],
                typeEmoji: TOKEN_TYPE_NAMES[tokenTypeNum].split(' ')[0],
                color: TOKEN_TYPE_COLORS[tokenTypeNum],
              };
            } catch (err) {
              // Si el token no existe, retornar null
              console.warn(`Token ${tokenId} no existe:`, err);
              return null;
            }
          })(i)
        );
      }

      const tokensData = await Promise.all(tokenDataPromises);
      // Filtrar tokens nulos (los que no existen)
      const validTokens = tokensData.filter((t): t is TokenData => t !== null);
      setTokens(validTokens);
      setError(null);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract) return;

    // Cargar tokens inicialmente
    fetchTokens();
    
    // Escuchar eventos de TokenCreated para actualizar automáticamente
    const handleTokenCreated = (tokenId: bigint, tokenType: number, producer: string) => {
      console.log('🆕 Nuevo token detectado:', { tokenId: tokenId.toString(), tokenType, producer });
      // Recargar todos los tokens cuando se crea uno nuevo
      fetchTokens();
    };

    // Suscribirse al evento TokenCreated
    contract.on('TokenCreated', handleTokenCreated);
    
    // Limpiar listener al desmontar
    return () => {
      contract.off('TokenCreated', handleTokenCreated);
    };
  }, [contract, fetchTokens]);

  const getTokenById = async (tokenId: number): Promise<TokenData | null> => {
    if (!contract) return null;

    try {
      const metadata = await contract.getTokenMetadata(tokenId);
      const tokenTypeNum = Number(metadata.tokenType) as TokenTypeValue;
      return {
        id: BigInt(tokenId),
        creator: metadata.producer,
        tokenType: Number(metadata.tokenType),
        parent1: metadata.parent1,
        parent2: metadata.parent2,
        timestamp: metadata.createdAt,
        typeName: TOKEN_TYPE_NAMES[tokenTypeNum],
        typeEmoji: TOKEN_TYPE_NAMES[tokenTypeNum].split(' ')[0],
        color: TOKEN_TYPE_COLORS[tokenTypeNum],
      };
    } catch (err) {
      console.error('Error fetching token:', err);
      return null;
    }
  };

  const getTokensByType = (tokenType: number): TokenData[] => {
    return tokens.filter(token => token.tokenType === tokenType);
  };

  return {
    tokens,
    loading,
    error,
    fetchTokens,
    getTokenById,
    getTokensByType,
  };
};
