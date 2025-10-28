/**
 * Besu Network Library Exports
 *
 * This file re-exports components from the besu-network-lib
 * to make them available throughout our application.
 *
 * IMPORTANTE: Usa el alias 'besu-network-lib' configurado en next.config.js
 * que apunta a ../lib/dist/src/create-besu-networks.js (código compilado)
 */

// ✅ Usar ES6 imports con el alias configurado en next.config.js
import BesuNetworkClass, {
  createBesuNetworkWithAutoAssociation as createWithAutoAssoc
} from 'besu-network-lib';

// Re-export usando ES6
export const BesuNetwork = BesuNetworkClass;
export const createBesuNetworkWithAutoAssociation = createWithAutoAssoc;

// Type exports usando el mismo alias
export type {
  BesuNodeConfig,
  SignerAccount,
  BesuNetworkConfig,
  KeyPair,
  BesuGenesisConfig,
  BesuNodeDefinition,
  BesuNetworkCreateOptions,
  DockerContainerConfig
} from 'besu-network-lib';

export default BesuNetwork;
