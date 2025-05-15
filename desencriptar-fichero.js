const { createECDH, createDecipheriv } = require("crypto");

const args = require("yargs").argv;
const fs = require("fs");
const algoritmo = "aes-256-cbc";
const rutaFicheroEncriptado =
  "./data/" + args.public + "-" + args.data + ".enc";
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
  const inputFile = fs.readFileSync(rutaFicheroEncriptado, "utf8");
  console.log("Texto cifrado:", inputFile);
  const secret = Uint8Array.from(
    origen.computeSecret(publica, "hex", "binary")
  );
  const descifrador = createDecipheriv(
    algoritmo,
    secret.slice(0, 32),
    secret.slice(0, 16)
  );
  let desencriptado = descifrador.update(inputFile, "hex", "utf8");
  desencriptado += descifrador.final("utf8");
  console.log("Texto descifrado:", desencriptado);
} catch (err) {
  console.error("Error al leer la clave pública:", err.message);
  process.exit(1);
}
