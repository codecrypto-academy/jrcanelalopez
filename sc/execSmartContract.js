const { ethers, JsonRpcProvider } = require("ethers");
const fs = require("fs");
// conexion al nodo desde nodejs
let httpProvider = new JsonRpcProvider("http://localhost:8545");
// lectura de los resultados de la compilacion
contractByteCode = fs
  .readFileSync("./out/contador_sol_Contador.bin")
  .toString();
contractAbi = JSON.parse(
  fs.readFileSync("./out/contador_sol_Contador.abi").toString()
);
// wallet con una clave creada en el genesis
const jsonWallet = `{"address":"7e50fa8509af04b463f519ea673f580a5b93ff76","crypto":{"cipher":"aes-128-ctr","ciphertext":"20068622a92b5e211ea4bf932370a85246a20f69eb70bdc671e6e20408e71b4f","cipherparams":{"iv":"df9121a34e51cd5d1e54db10356ba463"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"b50b4fa71aa94129c9ea2429045e03fbe7c2710a49a865c9af5339adab507c2c"},"mac":"8db5ef4f0785c3370973e5c698a9a5bc834e451f3818fbe7c9f1dd102e3e27a1"},"id":"5ec44d9a-0f58-4ea1-af6a-6dd2ff40d413","version":3}`;

async function main() {
  // crear una wallet con la clave privada y la pwd
  let wallet = await ethers.Wallet.fromEncryptedJson(jsonWallet, "123456");
  wallet = wallet.connect(httpProvider);
  // crear el contrato
  const c = fs.readFileSync("smartContractAddress.txt").toString();
  const contract = new ethers.Contract(c, contractAbi, wallet);

  let tx = await contract.inc();
  console.log(tx.nonce);
  tx = await contract.inc({
    nonce: tx.nonce + 1,
  });
  console.log(await contract.contador());
}
main();
