const express = require("express");
const Moralis = require("moralis").default;
const cors = require("cors");
const app = express();
const port = 3001;
require("dotenv").config();

app.use(cors());
app.use(express.json());

Moralis.start({ apiKey: process.env.MORALIS_API_KEY })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Moralis:", err.message);
    process.exit(1);
  });

app.get("/getTokens", async (req, res) => {
  try {
    const { address, chain } = req.query;
    if (!address || !chain) {
      return res.status(400).json({ error: "Missing address or chain param" });
    }

    const [tokens, nfts, balance] = await Promise.all([
      Moralis.EvmApi.token.getWalletTokenBalances({ address, chain }),
      Moralis.EvmApi.nft.getWalletNFTs({ chain, address, mediaItems: true }),
      Moralis.EvmApi.balance.getNativeBalance({ address, chain }),
    ]);

    return res.status(200).json({
      tokens: tokens.raw,
      nfts: nfts.raw,
      nativeBalance: balance.raw.balance / 10 ** 18,
    });
  } catch (e) {
    console.error("/getTokens error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});
