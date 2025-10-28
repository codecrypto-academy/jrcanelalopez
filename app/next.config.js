/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configurar alias para importar la librería Besu compilada
    // IMPORTANTE: Apuntar a dist/ (código compilado) no a src/ (código fuente)
    // NO especificar extensión .js para permitir que webpack y TypeScript resuelvan automáticamente

    // Alias principal para imports como: import { BesuNetwork } from 'besu-network-lib'
    config.resolve.alias["besu-network-lib"] = path.resolve(
      __dirname,
      "../lib/dist/src/create-besu-networks"
    );

    // Alias para imports específicos si es necesario
    config.resolve.alias["besu-lib"] = path.resolve(__dirname, "../lib/dist/src");

    return config;
  },

  // Transpile la librería local si es necesario
  transpilePackages: [],
};

module.exports = nextConfig;
