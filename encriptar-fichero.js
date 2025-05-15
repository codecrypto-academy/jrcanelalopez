/**
 * Script to encrypt a file using ECDH key agreement and AES-256-CBC symmetric encryption.
 *
 * Usage:
 *   node encriptar-fichero.js --private <privateKeyName> --public <publicKeyName> --data <fileName>
 *
 * Arguments:
 *   --private {string}  Name of the private key file (without extension) located in ./data/
 *   --public  {string}  Name of the public key file (without extension) located in ./data/
 *   --data    {string}  Name of the file to encrypt located in ./data/
 *
 * The script:
 *   1. Loads the private key and sets it for ECDH.
 *   2. Loads the public key and computes a shared secret.
 *   3. Uses the shared secret to derive an AES-256-CBC key and IV.
 *   4. Reads the input file, encrypts its contents, and writes the encrypted data to a new file.
 *
 * Error Handling:
 *   - Exits if required arguments are missing.
 *   - Exits if key files or data file cannot be read.
 *
 * Output:
 *   - Encrypted file is saved as ./data/<publicKeyName>-<fileName>.enc
 */
const { createCipheriv, createECDH } = require("crypto");
const args = require("yargs").argv;
const fs = require("fs");
const { createWriteStream } = require("fs");
const { pipeline } = require("stream");
const algoritmo = "aes-256-cbc";
const rutaFicheroEncriptado =
  "./data/" + args.public + "-" + args.data + ".enc";
const rutaFicheroTexto = "./data/" + args.data;
const rutaPublica = "./data/" + args.public + ".pub";
const rutaPrivada = "./data/" + args.private + ".key";

if (!args.private && !args.public && !args.data) {
  console.log("Es necesario el nombre de la clave");
  process.exit(1);
}

const origen = createECDH("secp521r1");

try {
  const private = fs.readFileSync(rutaPrivada, "utf8");
  origen.setPrivateKey(private, "hex");
} catch (err) {
  console.error("Error al leer la clave privada:", err.message);
  process.exit(1);
}
try {
  const publica = fs.readFileSync(rutaPublica, "utf8");
  console.log("Clave pública:", publica);
  const secret = Uint8Array.from(
    origen.computeSecret(publica, "hex", "binary")
  );
  const cifrador = createCipheriv(
    algoritmo,
    secret.slice(0, 32),
    secret.slice(0, 16)
  );

  const texto = fs.readFileSync(rutaFicheroTexto, "utf8");
  console.log("Texto a cifrar:", texto);
  let encriptado = cifrador.update(texto, "utf8", "hex");
  encriptado += cifrador.final("hex");
  console.log("Texto cifrado:", encriptado);
  fs.writeFileSync(rutaFicheroEncriptado, encriptado);
} catch (err) {
  console.error("Error al leer la clave pública:", err.message);
  process.exit(1);
}
