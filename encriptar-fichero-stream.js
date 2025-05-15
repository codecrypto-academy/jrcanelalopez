const { createCipheriv, createECDH } = require("crypto");
const args = require("yargs").argv;
const fs = require("fs");
const { pipeline } = require("stream");
const algoritmo = "aes-256-cbc";
const rutaFicheroEncriptado =
  "./data/" + args.public + "-" + args.data + ".enc";
const rutaFicheroTexto = "./data/" + args.data;
const rutaPublica = "./data/" + args.public + ".pub";
const rutaPrivada = "./data/" + args.private + ".key";

if (!args.private || !args.public || !args.data) {
  console.log("Es necesario el nombre de la clave");
  process.exit(1);
}

const origen = createECDH("secp521r1");

try {
  const privateKey = fs.readFileSync(rutaPrivada, "utf8");
  origen.setPrivateKey(privateKey, "hex");
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

  const input = fs.createReadStream(rutaFicheroTexto, { encoding: "utf8" });
  const output = fs.createWriteStream(rutaFicheroEncriptado);

  pipeline(input, cifrador, output, (err) => {
    if (err) {
      console.error("Error en el cifrado:", err.message);
      process.exit(1);
    } else {
      console.log("Archivo cifrado guardado en:", rutaFicheroEncriptado);
    }
  });
} catch (err) {
  console.error("Error al leer la clave pública:", err.message);
  process.exit(1);
}
