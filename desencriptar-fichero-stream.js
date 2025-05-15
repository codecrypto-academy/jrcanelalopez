const { createECDH, createDecipheriv } = require("crypto");
const fs = require("fs");
const { pipeline } = require("stream");
const args = require("yargs").argv;

const algoritmo = "aes-256-cbc";
const rutaFicheroEncriptado =
  "./data/" + args.public + "-" + args.data + ".enc";
const rutaFicheroSalida = "./data/" + args.data + ".descifrado";
const rutaPublica = "./data/" + args.public + ".pub";
const rutaPrivada = "./data/" + args.private + ".key";

if (!args.private || !args.public || !args.data) {
  console.log("Es necesario el nombre de la clave");
  process.exit(1);
}

const origen = createECDH("secp521r1");

try {
  const privada = fs.readFileSync(rutaPrivada, "utf8");
  origen.setPrivateKey(privada, "hex");

  const publica = fs.readFileSync(rutaPublica, "utf8");
  console.log("Clave pública:", publica);

  const secret = Uint8Array.from(
    origen.computeSecret(publica, "hex", "binary")
  );

  const descifrador = createDecipheriv(
    algoritmo,
    secret.slice(0, 32),
    secret.slice(0, 16)
  );

  const input = fs.createReadStream(rutaFicheroEncriptado);

  const output = fs.createWriteStream(rutaFicheroSalida);

  pipeline(input, descifrador, output, (err) => {
    if (err) {
      console.error("Error en el descifrado:", err.message);
      process.exit(1);
    } else {
      console.log("Archivo descifrado guardado en:", rutaFicheroSalida);
    }
  });
} catch (err) {
  console.error("Error al leer las claves:", err.message);
  process.exit(1);
}
