/**
 * Besu Network Management Server
 *
 * Servidor Node.js standalone que gestiona redes Besu.
 * Se ejecuta en paralelo a Next.js para evitar incompatibilidades con execSync.
 *
 * Puerto: 3001
 * Next.js: 3000
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const BesuNetwork = require('../lib/dist/src/create-besu-networks.js').default;

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active networks in memory
const networks = new Map();

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'besu-server',
    networks: networks.size
  });
});

/**
 * POST /networks - Create and start a new Besu network
 */
app.post('/networks', async (req, res) => {
  try {
    const { config, nodes } = req.body;

    console.log('[BESU-SERVER] Creating network:', config.name);

    // Generate unique network ID
    const networkId = `besu-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Prepare network configuration
    const networkConfig = {
      name: networkId,
      chainId: config.chainId,
      subnet: config.subnet,
      consensus: config.consensus,
      gasLimit: config.gasLimit,
      blockTime: config.blockTime,
      signerAccounts: config.signerAccounts.map(account => ({
        address: account.address,
        weiAmount: account.weiAmount
      }))
    };

    // Prepare nodes
    const besuNodes = nodes.map(node => ({
      name: node.name,
      ip: node.ip,
      rpcPort: node.rpcPort,
      p2pPort: node.p2pPort || 30303,
      type: node.type === 'validator' ? 'miner' : node.type
    }));

    // Create the network
    const networksDir = path.join(__dirname, 'networks');
    console.log('[BESU-SERVER] Networks dir:', networksDir);

    const besuNetworkInstance = new BesuNetwork(networkConfig, networksDir);

    console.log('[BESU-SERVER] Calling create()...');
    await besuNetworkInstance.create({
      nodes: besuNodes,
      initialBalance: "100", // 100 ETH
      autoResolveSubnetConflicts: true,
      autoGenerateSignerAccounts: true
    });
    console.log('[BESU-SERVER] Network config created');

    console.log('[BESU-SERVER] Starting containers...');
    await besuNetworkInstance.start();
    console.log('[BESU-SERVER] Network started successfully');

    // Get miner-signer associations
    const minerSignerAssociations = besuNetworkInstance.getMinerSignerAssociations();

    // Store network instance
    networks.set(networkId, {
      instance: besuNetworkInstance,
      config,
      nodes,
      status: 'running',
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: {
        networkId,
        minerSignerAssociations
      },
      message: 'Network created and started successfully'
    });

  } catch (error) {
    console.error('[BESU-SERVER] Error creating network:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error creating network',
      details: error.stack
    });
  }
});

/**
 * GET /networks - List all networks
 */
app.get('/networks', (req, res) => {
  const networksList = Array.from(networks.entries()).map(([id, data]) => ({
    id,
    config: data.config,
    nodes: data.nodes,
    status: data.status,
    createdAt: data.createdAt
  }));

  res.json({
    success: true,
    data: {
      networks: networksList,
      total: networksList.length
    }
  });
});

/**
 * GET /networks/:id - Get specific network
 */
app.get('/networks/:id', (req, res) => {
  const { id } = req.params;
  const network = networks.get(id);

  if (!network) {
    return res.status(404).json({
      success: false,
      error: `Network ${id} not found`
    });
  }

  res.json({
    success: true,
    data: {
      id,
      config: network.config,
      nodes: network.nodes,
      status: network.status,
      createdAt: network.createdAt
    }
  });
});

/**
 * POST /networks/:id/stop - Stop a network
 */
app.post('/networks/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const network = networks.get(id);

    if (!network) {
      return res.status(404).json({
        success: false,
        error: `Network ${id} not found`
      });
    }

    console.log('[BESU-SERVER] Stopping network:', id);
    await network.instance.stop();

    network.status = 'stopped';

    res.json({
      success: true,
      message: 'Network stopped successfully'
    });

  } catch (error) {
    console.error('[BESU-SERVER] Error stopping network:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /networks/:id/start - Start a stopped network
 */
app.post('/networks/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const network = networks.get(id);

    if (!network) {
      return res.status(404).json({
        success: false,
        error: `Network ${id} not found`
      });
    }

    console.log('[BESU-SERVER] Starting network:', id);
    await network.instance.start();

    network.status = 'running';

    res.json({
      success: true,
      message: 'Network started successfully'
    });

  } catch (error) {
    console.error('[BESU-SERVER] Error starting network:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /networks/:id - Delete a network
 */
app.delete('/networks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const network = networks.get(id);

    if (!network) {
      return res.status(404).json({
        success: false,
        error: `Network ${id} not found`
      });
    }

    console.log('[BESU-SERVER] Destroying network:', id);
    await network.instance.destroy();

    networks.delete(id);

    res.json({
      success: true,
      message: 'Network deleted successfully'
    });

  } catch (error) {
    console.error('[BESU-SERVER] Error deleting network:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /cleanup - Cleanup all networks
 */
app.post('/cleanup', async (req, res) => {
  try {
    console.log('[BESU-SERVER] Cleaning up all networks...');

    const results = [];
    for (const [id, network] of networks.entries()) {
      try {
        await network.instance.destroy();
        networks.delete(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Cleanup completed',
      results
    });

  } catch (error) {
    console.error('[BESU-SERVER] Error during cleanup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Besu Network Management Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Next.js app: http://localhost:3000`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[BESU-SERVER] Shutting down gracefully...');

  for (const [id, network] of networks.entries()) {
    try {
      await network.instance.stop();
      console.log(`[BESU-SERVER] Stopped network: ${id}`);
    } catch (error) {
      console.error(`[BESU-SERVER] Error stopping network ${id}:`, error);
    }
  }

  process.exit(0);
});
