const Web3 = require("web3").default;

const web3 = new Web3("http://localhost:8546");

const PASSWORD = process.env.PASSWORD;
const FROM_ADDRESS = "0x330f9a8ab840be595ec34c221e643395955dc8aa";
const TO_ADDRESS = "0x669f2ff7036ac5dfa2b6eaaf38f6696a958b4f16";
const VALUE_IN_ETHER = web3.utils.toWei("1", "ether");

async function getLastBlock() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("Block Number: ", blockNumber);
  } catch (error) {
    console.error("Error fetching block number: ", error);
  }
}

async function sendTransaction(from, to, value) {
  try {
    const transactionDetails = {
      from: from,
      to: to,
      value: value,
      gas: 21000, // Set a default gas limit
    };

    // Send the signed transaction
    const resultTransaction = await web3.eth.sendTransaction(
      transactionDetails,
      PASSWORD
    );
    console.log("Transaction Hash: ", resultTransaction.transactionHash);
  } catch (error) {
    console.error("Error sending transaction: ", error);
  }
}

async function getBlockNumber(number) {
  try {
    const block = await web3.eth.getBlock(number);
    console.log("Block: ", block);
  } catch (error) {
    console.error("Error fetching block: ", error);
  }
}

async function getBalance(address) {
  try {
    const balance = await web3.eth.getBalance(address);
    console.log("Balance: ", web3.utils.fromWei(balance, "ether"));
  } catch (error) {
    console.error("Error fetching balance: ", error);
  }
}

// Call the functions
getBalance(FROM_ADDRESS);
getLastBlock();
getBlockNumber(0);
sendTransaction(FROM_ADDRESS, TO_ADDRESS, VALUE_IN_ETHER);
