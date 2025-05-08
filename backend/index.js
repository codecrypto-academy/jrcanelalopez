const express = require("express");
const Web3 = require("web3").default;
const cors = require("cors");

const app = express();
app.use(cors());
const port = 3000;
const URL_MAINET = process.env.URL_MAINET;

const mainet = new Web3(URL_MAINET);

app.get("/bloque/:bloque", async (req, res) => {
  try {
    const block = await mainet.eth.getBlock(req.params.bloque);
    res.json(
      JSON.parse(
        JSON.stringify(block, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      )
    );
  } catch (error) {
    console.error("Error fetching block:", error);
    res.status(500).send("Error fetching block");
  }
});

app.get("/tx/:tx", async (req, res) => {
  try {
    const transaction = await mainet.eth.getTransaction(req.params.tx);
    res.json(
      JSON.parse(
        JSON.stringify(transaction, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      )
    );
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).send("Error fetching transaction");
  }
});

app.get("/balance/:address", async (req, res) => {
  try {
    const balance = await mainet.eth.getBalance(req.params.address);
    res.send(`Saldo: ${mainet.utils.fromWei(balance, "ether")} ETH`);
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).send("Error fetching balance");
  }
});

app.get("/bloque", async (req, res) => {
  try {
    const blockNumber = await mainet.eth.getBlockNumber();
    res.send(`${blockNumber}`);
  } catch (error) {
    console.error("Error fetching block number:", error);
    res.status(500).send("Error fetching block number");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
