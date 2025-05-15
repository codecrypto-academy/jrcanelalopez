const { createECDH } = require("crypto");
const yargs = require("yargs").argv;
const fs = require("fs");
console.log(yargs.name);
if (!yargs.name) {
  console.log("Es necesario el nombre de la clave");
  process.exit(1);
}

const parejaDeClaves = createECDH("secp521r1");
const clavePublica = parejaDeClaves.generateKeys("hex");
const clavePrivada = parejaDeClaves.getPrivateKey("hex");
fs.writeFileSync("./data/" + yargs.name + ".pub", clavePublica);
fs.writeFileSync("./data/" + yargs.name + ".key", clavePrivada);
