import express = require('express');
import { ethers } from 'ethers';

require('dotenv').config();

const cors = require('cors');
const URL_BASE_ETHEREUM_NODO = process.env.URL_BASE_ETHEREUM_NODO || '';
const KEYSTORE_FILE = process.env.KEYSTORE_FILE || '';
const KEYSTORE_PWD = process.env.KEYSTORE_PWD || '';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

if (!URL_BASE_ETHEREUM_NODO || !KEYSTORE_FILE || !KEYSTORE_PWD) {
  throw new Error('Missing required environment variables');
}
const app = express();
const port = PORT;

type ResponseRPC = {
    jsonrpc: string
    id: number
    result: string
  }

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get('/', (req, res) => {
    res.json({ message: 'Hola a todos!' });
});

app.get('/balanceEthers/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const provider = new ethers.JsonRpcProvider(URL_BASE_ETHEREUM_NODO);
        const balance = await provider.getBalance(address);
        res.json({ 
            address, 
            balance: Number(ethers.formatEther(balance)), 
            date: new Date().toISOString() 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Error fetching balance', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

app.get('/balance/:address', async (req, res) => {
    const address = req.params.address;
    const response = await fetch(URL_BASE_ETHEREUM_NODO, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [
              address,
              "latest",
            ],
            id: 1,
          }),
        })
        const result: ResponseRPC = await response.json()
        res.json({ 
            address, 
            balance: Number(result.result) / 10 ** 18, 
            date: new Date().toISOString() 
        });
});

app.get('/faucet/:address/:amount', async (req, res) => {
  const { address, amount } = req.params;
  try {
    const provider = new ethers.JsonRpcProvider(URL_BASE_ETHEREUM_NODO);
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(__dirname, KEYSTORE_FILE);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const wallet = await ethers.Wallet.fromEncryptedJson(fileContent, KEYSTORE_PWD);
    const walletConnected = wallet.connect(provider);

    const tx = await walletConnected.sendTransaction({
      to: address,
      value: ethers.parseEther(amount),
    });
    await tx.wait();
    const balance = await provider.getBalance(address);
    res.json({
      message: 'Transaction sent successfully',
      transactionHash: tx.hash,
      from: wallet.address,
      to: address,
      amount: ethers.formatEther(tx.value),
      balance: ethers.formatEther(balance),
      date: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error sending transaction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
